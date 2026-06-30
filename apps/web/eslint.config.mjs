import base from "@reelparty/config/eslint";

export default [
  ...base,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
