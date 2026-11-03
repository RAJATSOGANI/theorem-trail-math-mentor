<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Signed-in app pages live under src/routes/_authenticated/ (client-only shell with sidebar); AI calls go through server functions in src/lib/ai.functions.ts so prompts and keys stay server-side.
- Course and quiz content is static in src/lib/data.ts; only quiz attempts and profiles are stored in the database, lesson completion and tutor chat stay in the browser.
