import json
import time
from seleniumbase import Driver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# ─── CONFIG ───────────────────────────────────────────────────────────
TARGET_USERNAME = "F0ODHub"
AUTH_TOKEN = "2933a2ce362969cfe61c6130128c7ae076d97fc0"
CT0 = "866efc2809b442a6739090a05d3b9cba2402048cfd4c981d9efb252cd1060a90913606fb281443ad59c5f3e975db114fe4db6a6d19ab78a36665626ecd69cfed74c6ae9071f04b0ea1be29d32621adf0"
MAX_COMMENTS_PER_POST = 50  # ← Set your max comments here
SCROLL_DELAY_S = 2
MAX_POSTS = 2
GOTO_TIMEOUT_MS = 15000


# ──────────────────────────────────────────────────────────────────────


def fetch_replies(
        target_username: str = TARGET_USERNAME,
        auth_token: str = AUTH_TOKEN,
        ct0: str = CT0,
        max_posts: int = MAX_POSTS,
        max_comments_per_post: int = MAX_COMMENTS_PER_POST,
        goto_timeout_ms: int = GOTO_TIMEOUT_MS,
        scroll_delay_s: float = SCROLL_DELAY_S,
        save_to_file: bool = False,
):
    if not target_username:
        raise ValueError("target_username is required")
    if not auth_token or not ct0:
        raise ValueError("Twitter auth cookies are required")

    tweet_urls = []
    all_replies = []

    # Initialize SeleniumBase driver
    driver = Driver(uc=True, headless=False)  # uc=True for undetected mode

    try:
        # Set cookies
        driver.get("https://x.com")
        time.sleep(2)

        # Add authentication cookies
        driver.add_cookie({
            "name": "auth_token",
            "value": auth_token,
            "domain": ".x.com",
            "path": "/",
        })
        driver.add_cookie({
            "name": "ct0",
            "value": ct0,
            "domain": ".x.com",
            "path": "/",
        })

        # Refresh to apply cookies
        driver.refresh()
        time.sleep(3)

        def scroll_until_max_comments(max_comments: int) -> list:
            """Scroll and collect replies until max_comments or no new content."""
            collected_replies = []
            seen_texts = set()  # Track unique comments to avoid duplicates
            no_new_content_count = 0
            max_no_new_content = 3  # Stop after 3 scrolls with no new content

            while len(collected_replies) < max_comments:
                # Extract current visible replies
                replies = driver.execute_script("""
                const rows = [];

                document.querySelectorAll('article').forEach(article => {

                    const textEl =
                        article.querySelector('[data-testid="tweetText"]');

                    const userEl =
                        article.querySelector('[data-testid="User-Name"] a[href^="/"]');

                    const timeEl =
                        article.querySelector('time');

                    if (!textEl || !userEl)
                        return;

                    rows.push({
                        from_user: userEl.href.split('/').pop(),
                        reply_text: textEl.innerText,
                        date: timeEl ? timeEl.getAttribute('datetime') : ''
                    });
                });

                return rows;
                """)

                new_found = False

                for reply in replies:
                    # Use reply_text + from_user as unique key
                    unique_key = f"{reply.get('from_user', '')}:{reply.get('reply_text', '')}"
                    if unique_key not in seen_texts:
                        seen_texts.add(unique_key)
                        collected_replies.append(reply)
                        new_found = True
                        if len(collected_replies) >= max_comments:
                            break

                if len(collected_replies) >= max_comments:
                    break

                if not new_found:
                    no_new_content_count += 1
                    if no_new_content_count >= max_no_new_content:
                        print(f"    ⏹️ No new comments after {max_no_new_content} scrolls. Reached end.")
                        break
                else:
                    no_new_content_count = 0  # Reset counter when new content found

                # Scroll down to load more
                driver.execute_script("window.scrollBy(0, 1600)")
                time.sleep(scroll_delay_s)

            return collected_replies[:max_comments]

        # Step 1: Load your profile
        print(f"\n📄 Loading profile: @{target_username} ...")
        driver.get(f"https://x.com/{target_username}")

        # Wait for articles to load
        wait = WebDriverWait(driver, goto_timeout_ms / 1000)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "article")))

        # Step 2: Scroll to load posts
        driver.execute_script("window.scrollBy(0, 1600)")
        time.sleep(scroll_delay_s)
        driver.execute_script("window.scrollBy(0, 1600)")
        time.sleep(scroll_delay_s)

        # Step 3: Collect post URLs on the profile page
        print("\n🔎 Looking for tweets...")

        # Give React/X time to hydrate the timeline
        time.sleep(5)

        # Scroll a few times to load more tweets
        for _ in range(3):
            driver.execute_script("window.scrollBy(0, 2000)")
            time.sleep(2)

        # Debug info
        articles = driver.find_elements(By.TAG_NAME, "article")
        print(f"Articles found: {len(articles)}")

        status_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/status/"]')
        print(f"Status links found: {len(status_links)}")

        tweet_urls = driver.execute_script("""
            const urls = [];

            document.querySelectorAll('time').forEach(timeEl => {
                const link = timeEl.closest('a[href*="/status/"]');

                if (
                    link &&
                    link.href &&
                    link.href.includes('/status/') &&
                    !link.href.includes('/analytics')
                ) {
                    urls.push(link.href);
                }
            });

            return [...new Set(urls)];
        """)

        print("\nTweet URLs:")
        for url in tweet_urls:
            print(url)

        # Fallback method if first method fails
        if not tweet_urls:
            print("⚠️ Timestamp method found nothing. Trying fallback...")

            tweet_urls = driver.execute_script("""
                const urls = [];

                document.querySelectorAll('a[href*="/status/"]').forEach(a => {
                    if (
                        a.href &&
                        a.href.includes('/status/') &&
                        !a.href.includes('/analytics')
                    ) {
                        urls.push(a.href);
                    }
                });

                return [...new Set(urls)];
            """)

            print(f"Fallback found {len(tweet_urls)} URLs")

        if max_posts:
            tweet_urls = tweet_urls[:max_posts]

        print(f"\n✅ Captured {len(tweet_urls)} post URL(s).")

        if not tweet_urls:
            print("\n❌ No tweets found.")
            print("Current URL:", driver.current_url)
            print("Page title:", driver.title)

            html_preview = driver.page_source[:3000]
            print("\nHTML Preview:")
            print(html_preview)

            return
        # Step 4: Visit each post and scrape replies
        print("\n🔍 Fetching replies...\n")
        for idx, post_url in enumerate(tweet_urls, start=1):
            print(f"\n{'─' * 60}")
            print(f"[{idx}/{len(tweet_urls)}] {post_url}")
            driver.get(post_url)

            # Wait for replies to load
            try:
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "article")))
            except TimeoutException:
                print(f"    ⚠️ Timeout waiting for replies on {post_url}")
                continue

            # Scroll until max comments or end of comments
            replies = scroll_until_max_comments(max_comments_per_post)

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

            print(f"    📊 Collected {len(replies)} comment(s) for this post.")
            time.sleep(1)

        # Save results
        if save_to_file and all_replies:
            with open("replies.json", "w", encoding="utf-8") as f:
                json.dump(all_replies, f, ensure_ascii=False, indent=2)
            print(f"\n💾 Saved {len(all_replies)} replies to 'replies.json'")
        elif save_to_file:
            print("\n📭 No replies found.")

    finally:
        driver.quit()

    return all_replies


if __name__ == "__main__":
    fetch_replies(save_to_file=True)