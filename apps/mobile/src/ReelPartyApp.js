import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
  Share,
  AppState,
  Animated,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";

const SPOT_DISMISS_BEAT_MS = 500;
const SPOT_DISMISS_FADE_MS = 400;
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import {
  Play,
  Plus,
  Crown,
  Tv,
  X,
  Share2,
  Users,
  Sparkles,
  Bookmark,
  Smile,
  Home,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  Copy,
  ClipboardPaste,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react-native";

import * as api from "./api";
import { Avatar, avatarColorFor } from "./avatars";
import { C, FONT, QUEUE_SORTS } from "./theme";
import { WEB_ORIGIN } from "./config";
import {
  rid,
  code5,
  detectPlatform,
  normalizeClipboardText,
  parseJoinCodeFromUrl,
  reactionSummary,
  resolveMember,
  queueAdders,
  sortMembersForDisplay,
  sortQueue,
  memberLabel,
  hasActivity,
  formatAddedDate,
} from "./lib";
import {
  getUserId,
  loadSession,
  saveSession,
  loadQueueFilters,
  saveQueueFilters,
} from "./storage";
import Btn from "./ui/Btn";
import Sheet, { SheetHeader } from "./ui/Sheet";
import MicroConfetti from "./ui/MicroConfetti";
import Spinner from "./ui/Spinner";
import Thumb from "./ui/Thumb";
import { PlatformBadge } from "./ui/Platform";
import {
  ReactionChips,
  ReactionFan,
  ReactionBurst,
} from "./ui/Reactions";
import WelcomeBlock from "./ui/Welcome";
import WelcomeTexture from "./ui/WelcomeTexture";
import ConfettiOverlay from "./ui/Confetti";

function partyJoinUrl(code) {
  return `${WEB_ORIGIN}/join/${encodeURIComponent(code)}`;
}

export default function ReelPartyApp() {
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(width, 440) - 36;
  const cardWidth = (containerWidth - 16) / 2;

  const [me, setMe] = useState(null);
  const [myWatchingId, setMyWatchingId] = useState(null);
  const [screen, setScreen] = useState("home");
  const [party, setParty] = useState(null);
  const [code, setCode] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [caughtUpBurst, setCaughtUpBurst] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteVal, setPasteVal] = useState("");
  const [pasteBusy, setPasteBusy] = useState(false);
  const [viewersVideo, setViewersVideo] = useState(null);
  const [reactionFan, setReactionFan] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [joinViaLink, setJoinViaLink] = useState(false);
  const [unwatchConfirm, setUnwatchConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const [activeReactionBursts, setActiveReactionBursts] = useState({});
  const [queueSort, setQueueSort] = useState("added");
  const [queueSortDir, setQueueSortDir] = useState("asc");
  const [hideWatched, setHideWatched] = useState(false);
  const [filterUserId, setFilterUserId] = useState(null);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [spotDismissing, setSpotDismissing] = useState(false);
  const [spotFading, setSpotFading] = useState(false);

  const burstIdRef = useRef(0);
  const spotDismissTimersRef = useRef([]);
  const prevReactionsRef = useRef({});
  const reactionsInitRef = useRef(false);
  const localReactionAtRef = useRef({});
  const queueFiltersTouchedRef = useRef(false);
  const partySnapshotRef = useRef("");

  const spotFade = useRef(new Animated.Value(1)).current;

  const isHost = party?.hostId === me;

  const fireConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
  };
  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const refreshParty = useCallback(async () => {
    if (!code || !me) return null;
    try {
      const [p, mem, q] = await Promise.all([
        api.getParty(code),
        api.getMembers(code),
        api.getQueue(code),
      ]);
      if (!p || !mem.some((m) => m.id === me)) {
        partySnapshotRef.current = "";
        if (p && !mem.some((m) => m.id === me)) {
          showToast("You were removed from the party");
        }
        await saveSession(null);
        setScreen("home");
        setParty(null);
        setCode("");
        return null;
      }
      const snapshot = JSON.stringify({ p, mem, q });
      if (snapshot !== partySnapshotRef.current) {
        partySnapshotRef.current = snapshot;
        setParty({ ...p, members: mem, queue: q });
      }
      return { p, members: mem, queue: q };
    } catch {
      return null;
    }
  }, [code, me]);

  const completeReactionBurst = useCallback((videoId, burstId) => {
    setActiveReactionBursts((active) => {
      if (active[videoId]?.id !== burstId) return active;
      const updated = { ...active };
      delete updated[videoId];
      return updated;
    });
  }, []);

  const spawnReactionBurst = useCallback((videoId, emoji, member) => {
    if (!member || !emoji) return;
    const burst = {
      id: ++burstIdRef.current,
      at: Date.now(),
      videoId,
      emoji,
      name: member.name,
      color: member.color,
      userId: member.id,
    };
    setActiveReactionBursts((active) => ({ ...active, [videoId]: burst }));
  }, []);

  const syncPrevReaction = useCallback((videoId, userId, emoji) => {
    if (!prevReactionsRef.current[videoId])
      prevReactionsRef.current[videoId] = {};
    if (emoji) prevReactionsRef.current[videoId][userId] = emoji;
    else delete prevReactionsRef.current[videoId][userId];
  }, []);

  // ---- Init: load user id, restore session, handle deep-link join ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const uid = await getUserId();
      if (cancelled) return;
      setMe(uid);

      const initialUrl = await Linking.getInitialURL();
      const joinCodeFromUrl = parseJoinCodeFromUrl(initialUrl);
      const session = await loadSession();
      if (session?.watchingVideoId) setMyWatchingId(session.watchingVideoId);

      if (joinCodeFromUrl) {
        try {
          const p = await api.getParty(joinCodeFromUrl);
          if (!p) {
            setReady(true);
            setTimeout(
              () => showToast("That invite link isn't valid anymore"),
              0,
            );
            return;
          }
          if (session?.code === joinCodeFromUrl) {
            const mem = await api.getMembers(joinCodeFromUrl).catch(() => []);
            if (mem.some((m) => m.id === uid)) {
              setCode(joinCodeFromUrl);
              setScreen("party");
              setReady(true);
              return;
            }
          }
          setCode(joinCodeFromUrl);
          setJoinCode(joinCodeFromUrl);
          setJoinViaLink(true);
          setScreen("joinName");
          setReady(true);
          return;
        } catch {
          setReady(true);
          return;
        }
      }

      if (!session) {
        setReady(true);
        return;
      }
      try {
        const p = await api.getParty(session.code);
        if (p) {
          setCode(session.code);
          setScreen("party");
        } else await saveSession(null);
      } catch {
        await saveSession(null);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle deep links while the app is already running.
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const joinCodeFromUrl = parseJoinCodeFromUrl(url);
      if (!joinCodeFromUrl) return;
      (async () => {
        const p = await api.getParty(joinCodeFromUrl).catch(() => null);
        if (!p) {
          showToast("That invite link isn't valid anymore");
          return;
        }
        if (code === joinCodeFromUrl && screen === "party") return;
        setCode(joinCodeFromUrl);
        setJoinCode(joinCodeFromUrl);
        setJoinViaLink(true);
        setScreen("joinName");
      })();
    });
    return () => sub.remove();
  }, [code, screen]);

  useEffect(() => {
    if (!ready) return;
    if (screen === "party" && code) {
      saveSession(code, myWatchingId ?? undefined);
    } else if (screen === "home") {
      saveSession(null);
      setMyWatchingId(null);
    }
  }, [screen, code, ready, myWatchingId]);

  useEffect(() => {
    if (!code || screen !== "party") {
      setFiltersHydrated(false);
      queueFiltersTouchedRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const saved = await loadQueueFilters(code);
      if (cancelled) return;
      if (!queueFiltersTouchedRef.current) {
        setHideWatched(saved.hideWatched);
        setFilterUserId(saved.filterUserId);
      }
      setFiltersHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, screen]);

  useEffect(() => {
    if (!filtersHydrated || !code || screen !== "party") return;
    saveQueueFilters(code, { hideWatched, filterUserId });
  }, [filtersHydrated, code, screen, hideWatched, filterUserId]);

  useEffect(() => {
    if (!party?.queue || !filterUserId) return;
    if (!party.queue.some((v) => v.addedById === filterUserId)) {
      setFilterUserId(null);
    }
  }, [party?.queue, filterUserId]);

  useEffect(() => {
    if (!party?.queue || !myWatchingId) return;
    if (!party.queue.some((v) => v.id === myWatchingId)) {
      setMyWatchingId(null);
      saveSession(code, null);
    }
  }, [party?.queue, myWatchingId, code]);

  // Polling while in a party and the app is foregrounded.
  useEffect(() => {
    if (!code || screen !== "party" || !me) return;
    void refreshParty();
    const poll = setInterval(() => {
      if (AppState.currentState === "active") void refreshParty();
    }, 2000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void refreshParty();
    });
    return () => {
      clearInterval(poll);
      sub.remove();
    };
  }, [code, screen, me, refreshParty]);

  useEffect(() => {
    if (screen !== "party") partySnapshotRef.current = "";
  }, [screen]);

  useEffect(() => {
    if (screen !== "party") {
      reactionsInitRef.current = false;
      prevReactionsRef.current = {};
      setActiveReactionBursts({});
    }
  }, [screen]);

  // Detect reactions from other members to fire bursts.
  useEffect(() => {
    if (!party?.queue || !party.members) return;
    if (!reactionsInitRef.current) {
      prevReactionsRef.current = Object.fromEntries(
        party.queue.map((v) => [v.id, { ...(v.reactions || {}) }]),
      );
      reactionsInitRef.current = true;
      return;
    }
    party.queue.forEach((v) => {
      const prev = prevReactionsRef.current[v.id] || {};
      const curr = v.reactions || {};
      Object.entries(curr).forEach(([userId, emoji]) => {
        if (prev[userId] === emoji) return;
        const key = `${v.id}:${userId}`;
        if (
          userId === me &&
          Date.now() - (localReactionAtRef.current[key] || 0) < 500
        )
          return;
        const member = party.members.find((m) => m.id === userId);
        if (member) spawnReactionBurst(v.id, emoji, member);
      });
    });
    prevReactionsRef.current = Object.fromEntries(
      party.queue.map((v) => [v.id, { ...(v.reactions || {}) }]),
    );
  }, [party?.queue, party?.members, me, spawnReactionBurst]);

  useEffect(
    () => () => {
      spotDismissTimersRef.current.forEach((id) => clearTimeout(id));
      spotDismissTimersRef.current = [];
    },
    [],
  );

  // ---- Actions ----
  const createParty = async () => {
    const nm = nameInput.trim() || "Host";
    let c = code5();
    for (let i = 0; i < 5; i++) {
      if (!(await api.getParty(c))) break;
      c = code5();
    }
    await api.createParty(c, me, nm);
    setCode(c);
    setScreen("party");
    fireConfetti();
  };
  const doJoin = async () => {
    setJoinErr("");
    const c = joinCode.trim();
    if (c.length !== 5) {
      setJoinErr("Enter the 5-digit code");
      return;
    }
    const p = await api.getParty(c);
    if (!p) {
      setJoinErr("No party found with that code 🤔");
      return;
    }
    setJoinViaLink(false);
    setCode(c);
    setScreen("joinName");
  };
  const confirmJoinName = async () => {
    await api.joinParty(code, me, nameInput.trim() || "Guest");
    setJoinViaLink(false);
    setScreen("party");
    fireConfetti();
  };
  const copyInviteLink = async () => {
    if (!party?.code) return;
    try {
      await Clipboard.setStringAsync(partyJoinUrl(party.code));
      showToast("Invite link copied! 📋");
      setInviteOpen(false);
    } catch {
      showToast("Couldn't copy invite link");
    }
  };
  const shareInviteMessage = async () => {
    if (!party?.code) return;
    const link = partyJoinUrl(party.code);
    const hostName =
      party.members?.find((m) => m.id === party.hostId)?.name ||
      party.hostName ||
      "Someone";
    try {
      await Share.share({
        title: `Join ${hostName}'s ReelParty 🎬`,
        message: `Party code ${party.code} — watch TikToks, Reels & Shorts together\n${link}`,
        url: link,
      });
      setInviteOpen(false);
    } catch {
      showToast("Couldn't open share sheet");
    }
  };
  const ingestLink = async (raw) => {
    const text = normalizeClipboardText(raw);
    const det = detectPlatform(text);
    if (!det) {
      showToast("That's not a TikTok, Reels, or Shorts link 🙈");
      return;
    }
    setAdding(true);
    setAddMsg("Fetching video info…");
    const meta = await api.fetchMeta(det);
    const myName = party?.members.find((m) => m.id === me)?.name || "Someone";
    await api.addVideo({
      id: rid(),
      partyCode: code,
      ...det,
      ...meta,
      addedById: me,
      addedByName: myName,
      position: party?.queue.length || 0,
    });
    await refreshParty();
    setAdding(false);
    setAddMsg("");
    setPasteOpen(false);
    setPasteVal("");
    fireConfetti();
    showToast(
      `Added "${meta.title.slice(0, 28)}${meta.title.length > 28 ? "…" : ""}"`,
    );
  };

  const tapAdd = async () => {
    setPasteVal("");
    setPasteBusy(true);
    let text = "";
    try {
      text = normalizeClipboardText(await Clipboard.getStringAsync());
    } catch {}
    setPasteBusy(false);
    if (text && detectPlatform(text)) {
      void ingestLink(text);
      return;
    }
    setPasteOpen(true);
    if (text) setPasteVal(text);
  };

  const pasteFromClipboard = async () => {
    setPasteBusy(true);
    let text = "";
    try {
      text = normalizeClipboardText(await Clipboard.getStringAsync());
    } catch {}
    setPasteBusy(false);
    if (text) setPasteVal(text);
    else showToast("Nothing to paste");
  };

  const playVideo = async (vid) => {
    setMyWatchingId(vid.id);
    saveSession(code, vid.id);
    await api.playVideo(code, vid.id, me);
    await refreshParty();
    Linking.openURL(vid.url).catch(() => showToast("Couldn't open video"));
  };
  const removeVideo = async (vid) => {
    try {
      await api.removeVideo(code, vid.id, me);
      if (vid.id === myWatchingId) {
        setMyWatchingId(null);
        saveSession(code, null);
      }
      await refreshParty();
      setDeleteConfirm(null);
      showToast("Removed from queue");
    } catch {
      showToast("Couldn't remove video");
    }
  };
  const confirmDelete = () => {
    const vid = deleteConfirm;
    if (!vid) return;
    removeVideo(vid);
  };
  const confirmUnwatch = async () => {
    const vid = unwatchConfirm;
    if (!vid) return;
    try {
      await api.unwatchVideo(code, vid.id, me);
      setParty((p) =>
        p
          ? {
              ...p,
              queue: p.queue.map((v) => {
                if (v.id !== vid.id) return v;
                const watchedBy = v.watchedBy.filter((id) => id !== me);
                const reactions = { ...(v.reactions || {}) };
                delete reactions[me];
                return {
                  ...v,
                  watchedBy,
                  watchCount: watchedBy.length,
                  reactions,
                };
              }),
            }
          : null,
      );
      setUnwatchConfirm(null);
      showToast("Marked unwatched");
    } catch {
      showToast("Couldn't update watch status");
    }
  };
  const kickMember = async (memberId) => {
    try {
      await api.removeMember(code, memberId, me);
      await refreshParty();
      showToast("User removed");
    } catch {
      showToast("Couldn't remove user");
    }
  };
  const leave = () => {
    saveSession(null);
    setMyWatchingId(null);
    setMembersOpen(false);
    setScreen("home");
    setParty(null);
    setCode("");
    setNameInput("");
    setJoinCode("");
  };
  const activityFor = (video) => {
    const ids = new Set([
      ...(video.watchedBy || []),
      ...Object.keys(video.reactions || {}),
    ]);
    return [...ids]
      .map((id) => {
        const m = resolveMember(party, id, video);
        return {
          ...m,
          watched: video.watchedBy?.includes(id),
          reaction: video.reactions?.[id] || null,
        };
      })
      .sort(
        (a, b) =>
          Number(b.watched) - Number(a.watched) || a.name.localeCompare(b.name),
      );
  };
  const setReaction = async (vid, reaction) => {
    const prev = vid.reactions?.[me] || null;
    const removing = prev === reaction;
    const next = { ...(vid.reactions || {}) };
    if (removing) delete next[me];
    else next[me] = reaction;

    if (!removing) {
      localReactionAtRef.current[`${vid.id}:${me}`] = Date.now();
      syncPrevReaction(vid.id, me, reaction);
      const member = party?.members.find((m) => m.id === me);
      if (member) spawnReactionBurst(vid.id, reaction, member);
    } else {
      syncPrevReaction(vid.id, me, null);
    }

    setParty((p) =>
      p
        ? {
            ...p,
            queue: p.queue.map((v) =>
              v.id === vid.id ? { ...v, reactions: next } : v,
            ),
          }
        : null,
    );
    if (viewersVideo?.id === vid.id) {
      setViewersVideo((v) => (v ? { ...v, reactions: next } : null));
    }
    try {
      await api.reactToVideo(code, vid.id, me, reaction);
    } catch {
      setParty((p) =>
        p
          ? {
              ...p,
              queue: p.queue.map((v) =>
                v.id === vid.id ? { ...v, reactions: vid.reactions || {} } : v,
              ),
            }
          : null,
      );
      if (viewersVideo?.id === vid.id) setViewersVideo(vid);
      showToast("Couldn't save reaction");
    }
  };

  // ---- Derived ----
  const nowPlaying = party?.queue.find((q) => q.id === party.nowPlayingId);
  const sortedMembers = party
    ? sortMembersForDisplay(party.members, me, party.hostId)
    : [];
  const adders = party ? queueAdders(party, me) : [];
  const filteredQueue = party
    ? party.queue.filter((v) => {
        if (hideWatched && v.watchedBy?.includes(me) && v.id !== myWatchingId) {
          return false;
        }
        if (filterUserId && v.addedById !== filterUserId) return false;
        return true;
      })
    : [];
  const displayedQueue = sortQueue(filteredQueue, queueSort, queueSortDir);
  const queueWithoutSpotPin = party
    ? party.queue.filter((v) => {
        if (hideWatched && v.watchedBy?.includes(me)) return false;
        if (filterUserId && v.addedById !== filterUserId) return false;
        return true;
      })
    : [];
  const spotPinsQueue =
    hideWatched &&
    !!myWatchingId &&
    queueWithoutSpotPin.length === 0 &&
    displayedQueue.length === 1 &&
    displayedQueue[0]?.id === myWatchingId;
  const dismissMySpot = useCallback(() => {
    if (spotDismissing) return;
    setSpotDismissing(true);
    const beat = setTimeout(() => {
      setSpotFading(true);
      Animated.timing(spotFade, {
        toValue: 0,
        duration: SPOT_DISMISS_FADE_MS,
        useNativeDriver: true,
      }).start();
      const fade = setTimeout(() => {
        setMyWatchingId(null);
        saveSession(code, null);
        setSpotDismissing(false);
        setSpotFading(false);
        spotFade.setValue(1);
        spotDismissTimersRef.current = [];
      }, SPOT_DISMISS_FADE_MS);
      spotDismissTimersRef.current = [fade];
    }, SPOT_DISMISS_BEAT_MS);
    spotDismissTimersRef.current = [beat];
  }, [spotDismissing, code, spotFade]);
  const filterUser = filterUserId
    ? adders.find((m) => m.id === filterUserId)
    : null;
  const hasActiveFilters = hideWatched || filterUserId;
  const allCaughtUp =
    !!party &&
    party.queue.length > 0 &&
    displayedQueue.length === 0 &&
    !filterUserId;

  useEffect(() => {
    if (!allCaughtUp) {
      setCaughtUpBurst(false);
      return;
    }
    setCaughtUpBurst(true);
    const t = setTimeout(() => setCaughtUpBurst(false), 900);
    return () => clearTimeout(t);
  }, [allCaughtUp]);

  // ---- Render helpers ----
  const renderBg = (children) => (
    <LinearGradient
      colors={["#1a1a24", "#12121a", C.page]}
      locations={[0, 0.55, 1]}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.root}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );

  if (!ready) {
    return renderBg(
      <View style={styles.center}>
        <Spinner size={40} />
      </View>,
    );
  }

  const renderFormScreen = (opts) => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <Pressable style={styles.backBtn} onPress={opts.onBack}>
        <ArrowLeft size={18} color={C.text2} />
      </Pressable>
      <View style={styles.formHeader}>
        <Text style={styles.formEmoji}>{opts.emoji}</Text>
        <Text style={[styles.formTitle, { color: opts.color }]}>
          {opts.title}
        </Text>
        <Text style={styles.formSubtitle}>{opts.subtitle}</Text>
        {opts.note ? <Text style={styles.formNote}>{opts.note}</Text> : null}
      </View>
      {opts.input}
      {opts.error ? <Text style={styles.errText}>{opts.error}</Text> : null}
      <View style={styles.flex} />
      <Btn
        tone={opts.btnTone}
        full
        disabled={opts.btnDisabled}
        onPress={opts.onSubmit}
        style={{ marginBottom: 20 }}
      >
        {opts.btnLabel}
      </Btn>
    </KeyboardAvoidingView>
  );

  let content = null;

  if (screen === "home") {
    content = (
      <View style={styles.welcome}>
        <WelcomeTexture />
        <View style={{ height: 28 }} />
        <WelcomeBlock />
        <View style={styles.flex} />
        <View style={styles.welcomeActions}>
          <Btn
            tone="green"
            full
            onPress={() => {
              setNameInput("");
              setScreen("create");
            }}
          >
            <Sparkles size={20} color="#fff" />
            <Text style={styles.btnInlineText}>CREATE A PARTY</Text>
          </Btn>
          <Btn
            tone="blue"
            full
            onPress={() => {
              setJoinCode("");
              setJoinErr("");
              setScreen("join");
            }}
          >
            <Users size={20} color="#fff" />
            <Text style={styles.btnInlineText}>JOIN A PARTY</Text>
          </Btn>
        </View>
      </View>
    );
  } else if (screen === "create") {
    content = renderFormScreen({
      onBack: () => setScreen("home"),
      emoji: "👑",
      color: C.green,
      title: "You're the host!",
      subtitle: "What should we call you?",
      btnTone: "green",
      btnLabel: "LET'S GO 🚀",
      btnDisabled: !nameInput.trim(),
      onSubmit: createParty,
      input: (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={C.text3}
          maxLength={16}
          value={nameInput}
          onChangeText={setNameInput}
          onSubmitEditing={createParty}
          autoFocus
        />
      ),
    });
  } else if (screen === "join") {
    content = renderFormScreen({
      onBack: () => setScreen("home"),
      emoji: "🎟️",
      color: C.blue,
      title: "Join the party",
      subtitle: "Enter the 5-digit code",
      btnTone: "blue",
      btnLabel: "CONTINUE",
      btnDisabled: joinCode.length !== 5,
      onSubmit: doJoin,
      error: joinErr,
      input: (
        <TextInput
          style={styles.digit}
          placeholder="—————"
          placeholderTextColor={C.text3}
          keyboardType="number-pad"
          maxLength={5}
          value={joinCode}
          onChangeText={(t) => {
            setJoinCode(t.replace(/\D/g, ""));
            setJoinErr("");
          }}
          onSubmitEditing={doJoin}
          autoFocus
        />
      ),
    });
  } else if (screen === "joinName") {
    content = renderFormScreen({
      onBack: () => {
        setJoinViaLink(false);
        setScreen(joinViaLink ? "home" : "join");
      },
      emoji: "🙋",
      color: C.blue,
      title: "Almost in!",
      subtitle: "What's your name?",
      note: code ? `Party code ${code}` : null,
      btnTone: "green",
      btnLabel: "JOIN PARTY 🎉",
      btnDisabled: !nameInput.trim(),
      onSubmit: confirmJoinName,
      input: (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={C.text3}
          maxLength={16}
          value={nameInput}
          onChangeText={setNameInput}
          onSubmitEditing={confirmJoinName}
          autoFocus
        />
      ),
    });
  } else if (screen === "party" && !party) {
    content = (
      <View style={styles.center}>
        <Spinner size={40} />
      </View>
    );
  } else if (screen === "party" && party) {
    content = (
      <View style={styles.flex}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.ghostBtn} onPress={leave}>
            <Home size={18} color={C.text2} />
          </Pressable>
          <Pressable style={styles.codeBox} onPress={() => setInviteOpen(true)}>
            <Share2 size={16} color={C.green} />
            <Text style={styles.codeBoxCode}>{party.code}</Text>
            <Text style={styles.codeBoxHint}>INVITE</Text>
          </Pressable>
          <Pressable
            style={styles.tvBtn}
            onPress={() =>
              nowPlaying
                ? playVideo(nowPlaying)
                : showToast("Nothing playing in the party yet")
            }
          >
            <Tv size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Members */}
        <View style={styles.members}>
          <View style={[styles.membersPill, membersOpen && styles.membersPillOpen]}>
            <Pressable
              style={[
                styles.membersPillHeader,
                membersOpen && styles.membersPillHeaderOpen,
              ]}
              onPress={() => setMembersOpen((o) => !o)}
            >
              <Users size={16} color={C.text} />
              <Text style={styles.membersToggleText}>
                {party.members.length}{" "}
                {party.members.length === 1 ? "person" : "in party"}
              </Text>
              <ChevronDown
                size={16}
                color={C.text3}
                style={{
                  marginLeft: "auto",
                  transform: [{ rotate: membersOpen ? "180deg" : "0deg" }],
                }}
              />
            </Pressable>
            {membersOpen && (
              <View style={styles.membersList}>
                {sortedMembers.map((m) => (
                  <View key={m.id} style={styles.memberChip}>
                    <Avatar id={m.id} name={m.name} sm />
                    <Text style={styles.memberName}>{m.name}</Text>
                    {m.id === party.hostId && (
                      <Crown size={13} color="#FFC800" fill="#FFC800" />
                    )}
                    {isHost && m.id !== party.hostId && (
                      <Pressable onPress={() => kickMember(m.id)} hitSlop={6}>
                        <X size={14} color={C.text3} />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Queue */}
        <ScrollView
          style={styles.queueScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.queueHeader}>
            <View style={styles.queueHeaderTop}>
              <View style={styles.queueHeaderTitle}>
                <Text style={styles.queueTitle}>The Queue</Text>
                <Text style={styles.queueCount}>
                  {hasActiveFilters && displayedQueue.length < party.queue.length
                    ? `${displayedQueue.length} of ${party.queue.length} videos`
                    : `${party.queue.length} video${party.queue.length !== 1 ? "s" : ""}`}
                </Text>
              </View>
              {party.queue.length > 0 && (
                <Pressable
                  style={[styles.pill, hideWatched && styles.pillOnBlue]}
                  onPress={() => {
                    queueFiltersTouchedRef.current = true;
                    setHideWatched((on) => !on);
                  }}
                >
                  {hideWatched ? (
                    <EyeOff size={14} color={C.blue} />
                  ) : (
                    <Eye size={14} color={C.text2} />
                  )}
                  <Text style={[styles.pillText, hideWatched && { color: C.blue }]}>
                    Hide watched
                  </Text>
                </Pressable>
              )}
            </View>

            {party.queue.length > 0 && adders.length > 1 && (
              <View style={styles.pillRow}>
                <View style={styles.pillLabel}>
                  <Filter size={14} color={C.text3} />
                  <Text style={styles.pillLabelText}>Filter:</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillScroll}
                >
                  {adders.map((m) => {
                    const on = filterUserId === m.id;
                    const accent = m.color || avatarColorFor(m.id);
                    return (
                      <Pressable
                        key={m.id}
                        style={[
                          styles.pill,
                          on && {
                            borderColor: accent,
                            backgroundColor: accent + "22",
                          },
                        ]}
                        onPress={() => {
                          queueFiltersTouchedRef.current = true;
                          setFilterUserId((id) => (id === m.id ? null : m.id));
                        }}
                      >
                        <Avatar id={m.id} name={m.name} sm />
                        <Text style={[styles.pillText, on && { color: accent }]}>
                          {m.id === me ? "You" : m.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {party.queue.length > 1 && (
              <View style={styles.pillRow}>
                <View style={styles.pillLabel}>
                  <ArrowUpDown size={14} color={C.text3} />
                  <Text style={styles.pillLabelText}>Sort:</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillScroll}
                >
                  {QUEUE_SORTS.map(({ id, label }) => {
                    const on = queueSort === id;
                    const SortArrow = queueSortDir === "asc" ? ArrowUp : ArrowDown;
                    return (
                      <Pressable
                        key={id}
                        style={[styles.pill, on && styles.pillOnBlue]}
                        onPress={() => {
                          if (on) {
                            setQueueSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setQueueSort(id);
                            setQueueSortDir("asc");
                          }
                        }}
                      >
                        {on && <SortArrow size={12} color={C.blue} />}
                        <Text style={[styles.pillText, on && { color: C.blue }]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {party.queue.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Queue's empty!</Text>
              <Text style={styles.emptyHint}>
                Copy a link, then tap{" "}
                <Text style={{ color: C.green }}>＋</Text>
              </Text>
            </View>
          ) : displayedQueue.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.caughtUpEmoji}>
                {caughtUpBurst && !filterUserId ? <MicroConfetti /> : null}
                <Text style={styles.emptyEmoji}>{filterUserId ? "🔍" : "🎉"}</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {filterUserId
                  ? `No videos from ${filterUser?.name || "this person"}`
                  : "All caught up!"}
              </Text>
              <Text style={styles.emptyHint}>
                {filterUserId
                  ? "Try another filter or turn off your active filters."
                  : "Turn off Hide watched to see everything again."}
              </Text>
            </View>
          ) : (
            <Pressable
              disabled={!spotPinsQueue}
              onPress={() => {
                if (spotPinsQueue && !spotDismissing) dismissMySpot();
              }}
            >
              <Animated.View
                style={[
                  styles.grid,
                  spotFading && {
                    opacity: spotFade,
                    transform: [
                      {
                        translateY: spotFade.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
              {displayedQueue.map((v) => {
                const adder = resolveMember(party, v.addedById, v);
                const isMySpot = v.id === myWatchingId;
                const showAsMySpot = isMySpot && !spotDismissing;
                const iWatched = v.watchedBy?.includes(me);
                const reactionBurst = activeReactionBursts[v.id];
                const borderColor = showAsMySpot
                  ? C.blue
                  : v.id === party.nowPlayingId
                    ? C.purple
                    : C.borderAccent;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => playVideo(v)}
                    style={[
                      styles.card,
                      { width: cardWidth, borderColor },
                      showAsMySpot && styles.cardYours,
                    ]}
                  >
                    <View style={styles.cardThumb}>
                      <View style={styles.cardThumbMedia}>
                        <Thumb v={v} />
                        {showAsMySpot && <View style={styles.yourSpotShade} />}
                        {iWatched && !showAsMySpot && (
                          <View style={styles.watchedShade} />
                        )}
                      </View>
                      <PlatformBadge platform={v.platform} />

                      {reactionBurst && (
                        <View style={styles.burstLayer} pointerEvents="none">
                          <ReactionBurst
                            key={`${reactionBurst.id}-${reactionBurst.emoji}`}
                            burstId={reactionBurst.id}
                            emoji={reactionBurst.emoji}
                            name={reactionBurst.name}
                            userId={reactionBurst.userId}
                            onDone={() =>
                              completeReactionBurst(v.id, reactionBurst.id)
                            }
                          />
                        </View>
                      )}

                      {iWatched && (
                        <Pressable
                          onPress={() => setUnwatchConfirm(v)}
                          style={styles.watchedBadge}
                          hitSlop={4}
                        >
                          <Text style={styles.watchedBadgeText}>WATCHED</Text>
                        </Pressable>
                      )}

                      {hasActivity(v) && (
                        <Pressable
                          onPress={() => setViewersVideo(v)}
                          style={[styles.thumbBadge, styles.watchBadge]}
                          hitSlop={4}
                        >
                          <Eye size={16} color="#fff" />
                          <Text style={styles.watchBadgeText}>
                            {v.watchCount || 0}
                          </Text>
                        </Pressable>
                      )}

                      <View style={styles.reactBadgeWrap} pointerEvents="box-none">
                        <Pressable
                          onPress={() => setReactionFan({ video: v })}
                          style={styles.thumbBadge}
                          hitSlop={4}
                        >
                          {v.reactions?.[me] ? (
                            <Text style={styles.reactBadgeEmoji}>
                              {v.reactions[me]}
                            </Text>
                          ) : (
                            <Smile size={16} color="#fff" />
                          )}
                        </Pressable>
                      </View>

                      {(v.addedById === me || isHost) && (
                        <Pressable
                          onPress={() => setDeleteConfirm(v)}
                          style={[styles.thumbBadge, styles.removeBadge]}
                          hitSlop={4}
                        >
                          <Trash2 size={16} color="#fff" />
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {v.title}
                      </Text>
                      <ReactionChips
                        reactions={v.reactions}
                        onPress={() => setViewersVideo(v)}
                      />
                      <View style={styles.cardAdder}>
                        {adder.name && <Avatar id={adder.id} name={adder.name} sm />}
                        <View style={styles.cardAdderText}>
                          <Text style={styles.cardAdderName} numberOfLines={1}>
                            {memberLabel(adder)}
                          </Text>
                          {v.createdAt ? (
                            <Text style={styles.cardAdderDate}>
                              {formatAddedDate(v.createdAt)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              </Animated.View>
            </Pressable>
          )}
        </ScrollView>

        {/* FAB */}
        <View style={styles.fab}>
          <Btn
            tone="green"
            onPress={tapAdd}
            style={{ borderRadius: 999, paddingHorizontal: 22, paddingVertical: 16 }}
          >
            <Plus size={22} color="#fff" />
            <Text style={styles.btnInlineText}>ADD VIDEO</Text>
          </Btn>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {renderBg(
        <>
          {content}

          {confetti && <ConfettiOverlay />}

          {toast ? (
            <View style={styles.toast} pointerEvents="none">
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          ) : null}

          {inviteOpen && party && (
            <Sheet onClose={() => setInviteOpen(false)}>
              <SheetHeader>
                <Share2 size={32} color={C.blue} />
                <Text style={styles.sheetTitle}>Invite friends</Text>
                <Text style={styles.sheetSub}>
                  Party code{" "}
                  <Text style={{ color: C.blueDk, letterSpacing: 2 }}>
                    {party.code}
                  </Text>
                </Text>
              </SheetHeader>
              <View style={styles.sheetActions}>
                <Btn tone="blue" full onPress={copyInviteLink}>
                  <Copy size={18} color="#fff" />
                  <Text style={styles.btnInlineText}>COPY LINK</Text>
                </Btn>
                <Btn tone="green" full onPress={shareInviteMessage}>
                  <Share2 size={18} color="#fff" />
                  <Text style={styles.btnInlineText}>SHARE</Text>
                </Btn>
                <Btn tone="gray" full onPress={() => setInviteOpen(false)}>
                  CANCEL
                </Btn>
              </View>
            </Sheet>
          )}

          {deleteConfirm && (
            <Sheet onClose={() => setDeleteConfirm(null)}>
              <SheetHeader>
                <Trash2 size={32} color={C.red} />
                <Text style={styles.sheetTitle}>Remove from queue?</Text>
                <Text style={styles.sheetSub}>
                  {isHost && deleteConfirm.addedById !== me
                    ? `Remove "${deleteConfirm.title.slice(0, 40)}${deleteConfirm.title.length > 40 ? "…" : ""}" from the party queue.`
                    : "This video will be removed from the party queue."}
                </Text>
              </SheetHeader>
              <View style={styles.sheetActions}>
                <Btn tone="red" full onPress={confirmDelete}>
                  YES, REMOVE
                </Btn>
                <Btn tone="gray" full onPress={() => setDeleteConfirm(null)}>
                  CANCEL
                </Btn>
              </View>
            </Sheet>
          )}

          {unwatchConfirm && (
            <Sheet onClose={() => setUnwatchConfirm(null)}>
              <SheetHeader>
                <Text style={styles.sheetTitle}>Mark as unwatched?</Text>
                <Text style={styles.sheetSub}>
                  Remove your watched status from this video.
                </Text>
              </SheetHeader>
              <View style={styles.sheetActions}>
                <Btn tone="green" full onPress={confirmUnwatch}>
                  YES, MARK UNWATCHED
                </Btn>
                <Btn tone="gray" full onPress={() => setUnwatchConfirm(null)}>
                  CANCEL
                </Btn>
              </View>
            </Sheet>
          )}

          {viewersVideo && (
            <Sheet onClose={() => setViewersVideo(null)}>
              <SheetHeader style={styles.viewersHeader}>
                <View style={styles.viewersHead}>
                  <Eye size={20} color={C.green} />
                  <Text style={styles.viewersHeading}>Who watched</Text>
                </View>
                <Text style={styles.viewersTitle} numberOfLines={2}>
                  {viewersVideo.title}
                </Text>
              </SheetHeader>
              {reactionSummary(viewersVideo.reactions).length > 0 && (
                <View style={styles.viewersReactions}>
                  <Text style={styles.viewersReactionsLabel}>Reactions</Text>
                  <ReactionChips reactions={viewersVideo.reactions} lg />
                </View>
              )}
              <View style={styles.activityList}>
                {activityFor(viewersVideo).length === 0 ? (
                  <Text style={styles.activityEmpty}>No activity yet</Text>
                ) : (
                  activityFor(viewersVideo).map((w) => (
                    <View key={w.id} style={styles.activityRow}>
                      <Avatar id={w.id} name={w.name} sm />
                      <View style={styles.activityName}>
                        <Text style={styles.activityNameText} numberOfLines={1}>
                          {memberLabel(w)}
                        </Text>
                        {w.id === party?.hostId && (
                          <Crown size={13} color="#FFC800" fill="#FFC800" />
                        )}
                      </View>
                      <View style={styles.activityTags}>
                        {w.reaction && (
                          <Text style={styles.activityReact}>{w.reaction}</Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </Sheet>
          )}

          {pasteOpen && (
            <Sheet
              paste
              onClose={() => {
                setPasteOpen(false);
                setPasteVal("");
              }}
            >
              <SheetHeader>
                <Text style={[styles.sheetTitle, { marginTop: 0 }]}>
                  Add a link
                </Text>
                <Text style={[styles.sheetSub, { marginBottom: 4 }]}>
                  TikTok, Instagram Reels, or YouTube Shorts
                </Text>
              </SheetHeader>
              <View style={styles.pasteForm}>
                {pasteBusy && (
                  <View style={styles.pasteBusy}>
                    <Spinner size={18} color={C.blue} />
                    <Text style={styles.pasteBusyText}>Reading clipboard…</Text>
                  </View>
                )}
                {!pasteBusy && !pasteVal && (
                  <Btn tone="blue" full sm onPress={pasteFromClipboard}>
                    <ClipboardPaste size={18} color="#fff" />
                    <Text style={styles.btnInlineTextSm}>PASTE LINK</Text>
                  </Btn>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="https://…"
                  placeholderTextColor={C.text3}
                  value={pasteVal}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setPasteVal}
                  onSubmitEditing={() =>
                    detectPlatform(pasteVal) && ingestLink(pasteVal)
                  }
                />
                {pasteVal && !detectPlatform(pasteVal) ? (
                  <Text style={styles.errTextSm}>
                    Hmm, that link isn't supported 🙈
                  </Text>
                ) : null}
                <Btn
                  tone="green"
                  full
                  disabled={adding || !detectPlatform(pasteVal)}
                  onPress={() => ingestLink(pasteVal)}
                >
                  {adding ? (
                    <>
                      <Spinner size={18} color="#fff" />
                      <Text style={styles.btnInlineText}>
                        {addMsg || "Adding…"}
                      </Text>
                    </>
                  ) : (
                    "ADD TO QUEUE"
                  )}
                </Btn>
              </View>
            </Sheet>
          )}

          {reactionFan && (
            <ReactionFan
              value={
                (
                  party?.queue.find((q) => q.id === reactionFan.video.id) ||
                  reactionFan.video
                ).reactions?.[me] || null
              }
              onPick={(emoji) => {
                const vid =
                  party?.queue.find((q) => q.id === reactionFan.video.id) ||
                  reactionFan.video;
                setReaction(vid, emoji);
                setReactionFan(null);
              }}
              onClose={() => setReactionFan(null)}
            />
          )}

          {pasteBusy && !pasteOpen && (
            <View style={styles.readingHint} pointerEvents="none">
              <Spinner size={16} color={C.blue} />
              <Text style={styles.readingHintText}>Reading clipboard…</Text>
            </View>
          )}

          {adding && !pasteOpen && (
            <View style={styles.addingOverlay}>
              <Spinner size={40} />
              <Text style={styles.addingText}>{addMsg || "Adding…"}</Text>
            </View>
          )}
        </>,
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  root: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  btnInlineText: {
    color: "#fff",
    fontFamily: FONT.headBold,
    fontSize: 17,
    letterSpacing: 0.3,
  },
  btnInlineTextSm: {
    color: "#fff",
    fontFamily: FONT.headBold,
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Welcome
  welcome: { flex: 1, alignItems: "center" },
  welcomeActions: { width: "100%", gap: 14, paddingBottom: 20 },

  // Form screens
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: C.btnGhost,
    padding: 9,
    borderRadius: 12,
  },
  formHeader: { alignItems: "center", marginTop: 30 },
  formEmoji: { fontSize: 56 },
  formTitle: { fontFamily: FONT.headBold, fontSize: 26, marginTop: 8 },
  formSubtitle: {
    fontFamily: FONT.body,
    color: C.text2,
    marginTop: 4,
    fontSize: 15,
  },
  formNote: {
    color: C.text3,
    fontFamily: FONT.bodyHeavy,
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    width: "100%",
    fontSize: 18,
    fontFamily: FONT.body,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: C.border,
    backgroundColor: C.surface,
    color: C.text,
    marginTop: 24,
  },
  digit: {
    width: "100%",
    textAlign: "center",
    fontFamily: FONT.headBold,
    fontSize: 30,
    letterSpacing: 12,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: C.blue,
    backgroundColor: C.surface,
    color: C.blueDk,
    marginTop: 24,
  },
  errText: {
    color: C.red,
    fontFamily: FONT.bodyHeavy,
    textAlign: "center",
    marginTop: 12,
  },
  errTextSm: { color: C.red, fontFamily: FONT.bodyHeavy, fontSize: 13 },

  // Party top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ghostBtn: { backgroundColor: C.btnGhost, padding: 9, borderRadius: 12 },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: C.green,
    backgroundColor: "rgba(88,204,2,0.1)",
  },
  codeBoxCode: {
    fontFamily: FONT.headBold,
    fontSize: 22,
    letterSpacing: 4,
    color: "#46a302",
  },
  codeBoxHint: {
    fontSize: 11,
    fontFamily: FONT.bodyHeavy,
    color: C.green,
    letterSpacing: 0.4,
  },
  tvBtn: {
    backgroundColor: C.purple,
    padding: 9,
    borderRadius: 12,
  },

  // Members
  members: { marginTop: 14 },
  membersPill: {
    width: "100%",
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surface2,
    borderRadius: 18,
    overflow: "hidden",
  },
  membersPillOpen: {},
  membersPillHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  membersPillHeaderOpen: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  membersToggleText: { color: C.text, fontFamily: FONT.bodyHeavy, fontSize: 13 },
  membersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 10,
    borderRadius: 999,
  },
  memberName: { fontFamily: FONT.bodyHeavy, fontSize: 13, color: C.text },

  // Queue
  queueScroll: { flex: 1, marginTop: 16 },
  queueHeader: { marginBottom: 10 },
  queueHeaderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  queueHeaderTitle: { flexShrink: 1 },
  queueTitle: { fontFamily: FONT.headBold, fontSize: 18, color: C.text },
  queueCount: { color: C.text3, fontFamily: FONT.bodyHeavy, fontSize: 13 },
  pillRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  pillLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
  pillLabelText: { color: C.text3, fontFamily: FONT.bodyHeavy, fontSize: 12 },
  pillScroll: { gap: 6, paddingRight: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surface2,
  },
  pillText: { color: C.text2, fontFamily: FONT.bodyHeavy, fontSize: 12 },
  pillOnBlue: { borderColor: C.blue, backgroundColor: "rgba(28,176,246,0.12)" },

  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 10 },
  caughtUpEmoji: { alignItems: "center", justifyContent: "center" },
  emptyEmoji: { fontSize: 46 },
  emptyTitle: {
    fontFamily: FONT.bodyHeavy,
    color: C.text3,
    marginTop: 6,
    fontSize: 15,
  },
  emptyHint: {
    fontFamily: FONT.body,
    color: C.text3,
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: {
    backgroundColor: C.surface2,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 18,
    overflow: "hidden",
  },
  cardYours: {
    boxShadow: "0 0 0 2px #1cb0f6, 0 4px 16px rgba(28,176,246,0.2)",
  },
  cardThumb: {
    position: "relative",
    aspectRatio: 1,
    backgroundColor: "#000",
  },
  cardThumbMedia: { ...StyleSheet.absoluteFillObject },
  yourSpotShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,176,246,0.5)",
  },
  watchedShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  burstLayer: { ...StyleSheet.absoluteFillObject, zIndex: 4 },
  watchedBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    zIndex: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: C.green,
  },
  watchedBadgeText: { fontSize: 10, fontFamily: FONT.bodyHeavy, color: "#fff" },
  thumbBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    height: 40,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  watchBadge: { position: "absolute", zIndex: 3, bottom: 6, right: 6, gap: 4 },
  watchBadgeText: { color: "#fff", fontSize: 11, fontFamily: FONT.bodyHeavy },
  reactBadgeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    zIndex: 3,
    alignItems: "center",
  },
  reactBadgeEmoji: { fontSize: 18 },
  removeBadge: { position: "absolute", zIndex: 3, bottom: 6, left: 6 },
  cardBody: { paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8 },
  cardTitle: {
    fontFamily: FONT.bodyHeavy,
    fontSize: 12,
    lineHeight: 15,
    color: C.text,
  },
  cardAdder: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  cardAdderText: { flex: 1, minWidth: 0 },
  cardAdderName: {
    fontSize: 11,
    fontFamily: FONT.body,
    color: C.text2,
    lineHeight: 13,
  },
  cardAdderDate: {
    fontSize: 10,
    fontFamily: FONT.body,
    color: C.text3,
    lineHeight: 12,
    marginTop: 1,
  },

  // FAB
  fab: { position: "absolute", right: 0, bottom: 10, zIndex: 40 },

  // Toast
  toast: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: "center",
    zIndex: 70,
  },
  toastText: {
    backgroundColor: C.surface2,
    color: C.text,
    fontFamily: FONT.body,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    maxWidth: "90%",
  },

  // Sheets
  sheetCenter: { alignItems: "center" },
  sheetTitle: {
    fontFamily: FONT.headBold,
    fontSize: 20,
    color: C.text,
    marginTop: 8,
    textAlign: "center",
  },
  sheetSub: {
    fontFamily: FONT.body,
    color: C.text2,
    fontSize: 13,
    marginBottom: 12,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
  sheetActions: { gap: 10, marginTop: 4 },
  sectionLabel: {
    color: C.text3,
    fontFamily: FONT.bodyHeavy,
    fontSize: 12,
    marginBottom: 8,
  },
  viewersHeader: { marginBottom: 10 },
  viewersHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  viewersHeading: {
    fontFamily: FONT.headBold,
    fontSize: 18,
    color: C.text,
  },
  viewersTitle: {
    fontFamily: FONT.body,
    color: C.text2,
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
    lineHeight: 18,
  },
  viewersReactions: { marginBottom: 12, alignItems: "center" },
  viewersReactionsLabel: {
    fontFamily: FONT.bodyHeavy,
    fontSize: 11,
    color: C.text3,
    letterSpacing: 0.4,
    marginBottom: 6,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // Activity list
  activityList: { gap: 4, marginTop: 16 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 12,
  },
  activityName: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  activityNameText: { fontFamily: FONT.bodyHeavy, fontSize: 14, color: C.text },
  activityTags: { flexDirection: "row", alignItems: "center", gap: 4 },
  activityReact: { fontSize: 16, paddingHorizontal: 4 },
  activityEmpty: {
    color: C.text2,
    fontFamily: FONT.body,
    fontSize: 13,
    textAlign: "center",
  },

  // Paste
  pasteForm: { gap: 12, marginTop: 4 },
  pasteBusy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  pasteBusyText: { fontFamily: FONT.bodyHeavy, fontSize: 13, color: C.blue },
  readingHint: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    zIndex: 80,
  },
  readingHintText: { fontFamily: FONT.bodyHeavy, fontSize: 13, color: C.text },

  // Adding overlay
  addingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.loading,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 65,
  },
  addingText: { fontFamily: FONT.bodyHeavy, color: C.green },
});
