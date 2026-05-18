import asyncio
import json
from playwright.async_api import async_playwright

# ─── CONFIG ───────────────────────────────────────────────────────────
TARGET_USERNAME = "F0ODHub"
AUTH_TOKEN = "5bac53b1dd82e7ee2e9aa09c30e70682bb16cc8e"
CT0 = "72f6c0b811e6d5d645c5a91a80bab7b645a751eeed6547a8f3bf692460f168092db416649ebb7e9c8a26ff96e651447f32d7fa8e25bef0435fe54af4f0b1d11fceef505c131200c84b30f9331a24bd56"
SCROLL_COUNT = 2
SCROLL_DELAY_S = 2
MAX_POSTS = 5
GOTO_TIMEOUT_MS = 6000
# ──────────────────────────────────────────────────────────────────────


async def fetch_replies(
    target_username: str = TARGET_USERNAME,
    auth_token: str = AUTH_TOKEN,
    ct0: str = CT0,
    scroll_count: int = SCROLL_COUNT,
    scroll_delay_s: float = SCROLL_DELAY_S,
    max_posts: int = MAX_POSTS,
    goto_timeout_ms: int = GOTO_TIMEOUT_MS,
    save_to_file: bool = False,
):
    if not target_username:
        raise ValueError("target_username is required")
    if not auth_token or not ct0:
        raise ValueError("Twitter auth cookies are required")

    tweet_urls = []
    all_replies = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        await context.add_cookies(
            [
                {
                    "name": "auth_token",
                    "value": auth_token,
                    "domain": ".x.com",
                    "path": "/",
                },
                {"name": "ct0", "value": ct0, "domain": ".x.com", "path": "/"},
            ]
        )

        page = await context.new_page()

        async def scroll_down(times: int, delay_s: int) -> None:
            for _ in range(times):
                await page.mouse.wheel(0, 1600)
                await asyncio.sleep(delay_s)

        # Step 1: Load your profile
        print(f"\n📄 Loading profile: @{target_username} ...")
        await page.goto(
            f"https://x.com/{target_username}",
            wait_until="domcontentloaded",
            timeout=goto_timeout_ms,
        )
        await page.wait_for_selector("article", timeout=goto_timeout_ms)

        # Step 2: Scroll to load posts
        await scroll_down(scroll_count, scroll_delay_s)

        # Step 3: Collect post URLs on the profile page
        tweet_urls.extend(await page.evaluate("""
            () => {
                const anchors = Array.from(document.querySelectorAll('a[href*="/status/"]'));
                const urls = anchors
                    .map(a => a.href)
                    .filter(href => href.includes('/status/'))
                    .filter(href => !href.includes('/analytics'));
                return Array.from(new Set(urls));
            }
            """))

        if max_posts:
            tweet_urls[:] = tweet_urls[:max_posts]

        print(f"\n✅ Captured {len(tweet_urls)} post URL(s).")

        if not tweet_urls:
            print("📭 No post URLs found. Make sure you're logged in correctly.")
            await browser.close()
            return

        # Step 4: Visit each post and scrape replies (date, user, comment)
        print("\n🔍 Fetching replies...\n")
        for idx, post_url in enumerate(tweet_urls, start=1):
            print(f"\n{'─'*60}")
            print(f"[{idx}/{len(tweet_urls)}] {post_url}")
            await page.goto(
                post_url,
                wait_until="domcontentloaded",
                timeout=goto_timeout_ms,
            )
            await page.wait_for_selector("article", timeout=goto_timeout_ms)
            await scroll_down(2, 1)

            replies = await page.evaluate("""
                () => {
                    const articles = Array.from(document.querySelectorAll('article'));
                    const rows = [];

                    for (const article of articles) {
                        const textEl = article.querySelector('[data-testid="tweetText"]');
                        const timeEl = article.querySelector('time');
                        const userEl = article.querySelector('[data-testid="User-Name"] a[href^="/"]');

                        const reply_text = textEl ? textEl.innerText.trim() : "";
                        const date = timeEl ? (timeEl.getAttribute('datetime') || timeEl.innerText.trim()) : "";
                        const from_user = userEl ? userEl.getAttribute('href').replace('/', '') : "";

                        if (reply_text && from_user) {
                            rows.push({ from_user, reply_text, date });
                        }
                    }

                    return rows;
                }
                """)

            for reply in replies:
                all_replies.append(
                    {
                        "post_url": post_url,
                        "from_user": reply.get("from_user", ""),
                        "reply_text": reply.get("reply_text", ""),
                        "date": reply.get("date", ""),
                    }
                )
                print(
                    f"    💬 @{reply.get('from_user', '')}: {reply.get('reply_text', '')[:60]}..."
                )

        await browser.close()

        # Save results
        if save_to_file and all_replies:
            with open("replies.json", "w", encoding="utf-8") as f:
                json.dump(all_replies, f, ensure_ascii=False, indent=2)
            print(f"\n💾 Saved {len(all_replies)} replies to 'replies.json'")
        elif save_to_file:
            print("\n📭 No replies found.")

    return all_replies


if __name__ == "__main__":
    asyncio.run(fetch_replies(save_to_file=True))
