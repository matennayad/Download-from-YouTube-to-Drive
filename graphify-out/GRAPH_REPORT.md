# Graph Report - download-from-youtube-to-drive  (2026-11-25)

## Corpus Check
- 6 files · ~34,117 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 630 edges · 13 communities
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10f8f4ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- startUI
- Gemini Images to Drive.user.js
- Download from YouTube to Drive.user.js
- Mitmachim ZI to ZIP.user.js
- Mitmachim Star Links.user.js
- startPlayground
- decorateLinks
- scan
- decorateFiles
- buildBody
- collect
- fetchPreview
- סקריפטים למתמחים טופ (Tampermonkey)

## God Nodes (most connected - your core abstractions)
1. `startUI()` - 42 edges
2. `buildEntry()` - 17 edges
3. `startChannelFlow()` - 16 edges
4. `startPlayground()` - 14 edges
5. `createFloatingMenu()` - 13 edges
6. `scan()` - 13 edges
7. `send()` - 12 edges
8. `checkAuthAndShowOptions()` - 11 edges
9. `submitChannelJob()` - 11 edges
10. `triggerDownload()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `decorateFiles()` --calls--> `fixName()`  [EXTRACTED]
  Mitmachim ZI to ZIP.user.js → Mitmachim ZI to ZIP.user.js  _Bridges community 10 → community 8_
- `collect()` --calls--> `isSiteHost()`  [EXTRACTED]
  Mitmachim ZI to ZIP.user.js → Mitmachim ZI to ZIP.user.js  _Bridges community 6 → community 10_
- `decorateFiles()` --calls--> `toUrl()`  [EXTRACTED]
  Mitmachim ZI to ZIP.user.js → Mitmachim ZI to ZIP.user.js  _Bridges community 6 → community 8_
- `buildImageTile()` --calls--> `loadSize()`  [EXTRACTED]
  Mitmachim ZI to ZIP.user.js → Mitmachim ZI to ZIP.user.js  _Bridges community 8 → community 9_
- `scan()` --calls--> `collect()`  [EXTRACTED]
  Mitmachim ZI to ZIP.user.js → Mitmachim ZI to ZIP.user.js  _Bridges community 10 → community 7_

## Import Cycles
- None detected.

## Communities (13 total, 0 thin omitted)

### Community 0 - "startUI"
Cohesion: 0.08
Nodes (49): AuthError, credsReady(), findOrCreateFolder(), gapi(), getToken(), gx(), relayCall(), saveAccessToken() (+41 more)

### Community 1 - "Gemini Images to Drive.user.js"
Cohesion: 0.11
Nodes (49): addPending(), buildEntry(), buttonStyle(), checkAuthAndContinue(), clearPendingVerification(), closeCurrentOverlay(), composedClosest(), containerHasBrokenGeneratedImage() (+41 more)

### Community 2 - "Download from YouTube to Drive.user.js"
Cohesion: 0.14
Nodes (44): addHoverEffect(), addToChannelLog(), beginWorkingState(), channelLogKey(), checkAuthAndShowOptions(), clearChannelLog(), clearPendingVerification(), closeCurrentOverlay() (+36 more)

### Community 3 - "Mitmachim ZI to ZIP.user.js"
Cohesion: 0.17
Nodes (18): breakLinks(), breakText(), breakUrl(), clean(), cleanText(), fixAll(), fixFile(), fixFormData() (+10 more)

### Community 4 - "Mitmachim Star Links.user.js"
Cohesion: 0.19
Nodes (15): addStyle(), applySetting(), breakLinks(), breakText(), breakUrl(), clean(), cleanText(), fixAll() (+7 more)

### Community 5 - "startPlayground"
Cohesion: 0.33
Nodes (13): startPlayground(), autoFlow(), findAuthorizeButton(), findExchangeButton(), findInput(), findScopeInput(), findStepHeader(), readTokens() (+5 more)

### Community 6 - "decorateLinks"
Cohesion: 0.29
Nodes (10): decodeHtml(), decorateLinks(), decorateTopics(), excerpt(), getPost(), getTopic(), isBareExternal(), isBareUrl() (+2 more)

### Community 7 - "scan"
Cohesion: 0.22
Nodes (9): addStyle(), applySetting(), fixStars(), openSettings(), restoreFiles(), restoreStars(), restoreTopics(), scan() (+1 more)

### Community 8 - "decorateFiles"
Cohesion: 0.36
Nodes (8): bindDownload(), buildFileTile(), decorateFiles(), extOf(), formatSize(), iconSvg(), loadSize(), triggerDownload()

### Community 9 - "buildBody"
Cohesion: 0.32
Nodes (8): buildBody(), buildImageTile(), buildLinkCard(), buildPanel(), buildSpoilerImages(), loadImage(), section(), stopSiteNavigation()

### Community 10 - "collect"
Cohesion: 0.47
Nodes (6): collect(), fixLinkText(), fixName(), isDecorative(), nameFromLink(), nameFromUrl()

### Community 11 - "fetchPreview"
Cohesion: 0.40
Nodes (5): decodeBytes(), decodeEntities(), fetchPreview(), getPreview(), parseMeta()

### Community 12 - "סקריפטים למתמחים טופ (Tampermonkey)"
Cohesion: 0.40
Nodes (4): Download-from-YouTube-to-Drive, מסיר ומוסיף כוכב*ות, סקריפטים למתמחים טופ (Tampermonkey), תיקון ZI ל-ZIP במתמחים טופ - הסקריפט המלא

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `startPlayground()` connect `startPlayground` to `startUI`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `startUI()` (e.g. with `jumbomail-to-drive.user.js` and `load()`) actually correct?**
  _`startUI()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `startUI` be split into smaller, more focused modules?**
  _Cohesion score 0.08208020050125313 - nodes in this community are weakly interconnected._
- **Should `Gemini Images to Drive.user.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11236802413273002 - nodes in this community are weakly interconnected._
- **Should `Download from YouTube to Drive.user.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1393939393939394 - nodes in this community are weakly interconnected._