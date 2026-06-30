import base from "@reelparty/config/eslint";

export default [
  ...base,
  {
    ignores: [".expo/**", "expo-env.d.ts"],
  },
];
