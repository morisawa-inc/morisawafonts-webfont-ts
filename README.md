# Morisawa Fonts web font API for TypeScript

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/morisawa-inc/morisawafonts-webfont-ts)

[Morisawa Fonts](https://morisawafonts.com/) の Web フォント API を TypeScript で利用するためのライブラリです。

- [API ドキュメント](https://developers.morisawafonts.com/docs/api/webfont/)

## インストール

```sh
npm install @morisawa/morisawafonts-webfont
```

## 利用方法

このライブラリを利用するには API トークンが必要です。
[Web プロジェクト設定](https://webproject.morisawafonts.com/) から API トークンを取得してください。

以下は利用例です。

```ts
import MorisawaFontsWebFont from "@morisawa/morisawafonts-webfont";

const client = new MorisawaFontsWebFont({
  apiToken: "your-token",
});

// 登録ドメインを取得する例
for await (const domain of client.domains.list()) {
  console.log(domain.value);
}

// 登録ドメインを追加する例
await client.domains.add(["example.com", "example.net"]);
```
