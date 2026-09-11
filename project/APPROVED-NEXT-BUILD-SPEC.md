# FORGE CRM — APPROVED NEXT BUILD SPEC

This file consolidates the user's latest approved requirements. **Latest wording here overrides older conflicting instructions.** Preserve all existing approved functionality and design that is not explicitly changed below. Implement only real working behavior; do not fabricate integrations, files, data, status, or test results.

## 1. Source and typography

- Start from the verified Forge CRM 004 multi-file build in this package.
- Use `Grokcrm-main.zip` / the user's full reference CRM as the typography reference where supplied in the working conversation.
- Use the exact Inter setup from the reference: Google Inter 400, 500, 600, 700 plus italic 400; use Inter throughout normal CRM UI text and numbers.
- Do not use artificial/interpolated weights such as 450, 550, or 650.
- Standard/default CRM font size remains 16px.
- Middle-panel typography should be about 1px larger than the corresponding existing middle-panel typography while preserving hierarchy.
- Middle-panel normal information should look regular/light, not bold. Use stronger weight only where hierarchy requires it.
- Lead revenue uses Inter and should be lighter, approximately weight 500.
- Lead person's first/last name under the company name should use regular Inter 400 in a readable muted gray; company name remains the stronger primary line.

## 2. Navigation and shell

- Use the compact left sidebar, not the old top navigation.
- Keep the Forge three dots at the top.
- Sidebar can expand into a wider bar showing text page names.
- Pages: Leads, Messages, Email, Scanner, Command, Notifications.
- Leads remains the working CRM page. Other pages remain blank unless separately requested.
- Keep the user/account control at the bottom of the sidebar.
- Clicking the user control opens the existing account popup with Settings and Log Out.
- Clicking Settings opens its own settings modal.
- Do not fake authentication; if no auth service exists, Log Out must not pretend to succeed.

## 3. Screen sizing, panels, and scrolling

- All three panels are open by default.
- Panel 1 should normally target about 460px and stay within the user's requested roughly 440–480px range; retain the 480px maximum unless a later explicit requirement overrides it.
- Panels 2 and 3 use the remaining width cleanly; Panel 3 may be resized wider than Panel 2.
- Panel 3 should normally be fully open.
- Both dividers remain draggable and remembered between sessions.
- The CRM should automatically detect the actual viewport/screen class and choose an appropriate screen scale/font accommodation by default.
- Preserve manual settings/override controls for screen scale and font/icon size. Manual choices must really affect the UI and persist.
- Keep Standard / Wide / Ultra-Wide behavior, with Ultra-Wide intended for a 32-inch ultra-wide class viewport.
- Font/Icon Size control remains 15px–19px in 0.5px steps.
- **006 clarification:** changing Screen Scale must proportionally resize the full CRM shell and controls, not only one panel or content padding, while the app continues to fill the viewport cleanly. Font/Icon Size changes must likewise resize UI text/icons without breaking panel visibility or overflow.
- All three main panels need independent scrolling.
- Mouse-wheel/trackpad scrolling must work normally.
- Scrollbars should be thinner than the current visible scrollbar, approximately 4px where supported.
- Scrollbars should be visually hidden when idle and only become visible when the pointer is over the relevant right-side scroll area/panel, while remaining manually draggable when shown.

## 4. Communications device control

- Keep the Communications phone/device text strip removed.
- Keep a compact signal/device icon in the top area with a small green connected / red disconnected indicator based on the existing real/mock device state already present in the app.
- Clicking it opens the existing device-switch modal. Do not create duplicate device implementations.

## 5. Lead list

- Lead initials are 28px true circles, not rounded squares.
- Letters may be slightly larger and the circles may sit slightly farther left for cleaner alignment.
- Remove numbered lead-row indicators.
- Expand the muted premium avatar palette.
- Two consecutive visible leads must never use the same avatar color, including after search/filtering changes the visible order.
- Lead revenue amount uses the same Inter family as lead names and should be less bold, approximately 500.

## 6. Middle-panel header

- Main goal: clean, aligned, professional, easy to scan, and not confusing.
- Keep the company name as the primary title.
- **006 clarification:** show the same lead initials circle immediately to the left of the company title in the middle panel, using the same lead color/style at approximately 38px so it balances with the title without becoming oversized.
- Improve the star visually; use a clean professional outline/favorite treatment and preserve its real existing behavior if one exists.
- Do not show an Active Lead/status pill for now.
- Put a small monochrome outline Application PDF icon next to the company title when an actual application file exists. The icon should look like a paper/PDF outline with an empty interior and folded top-right corner; no red fill. Clicking it opens the actual application in the existing viewer.
- Keep the compact identifying summary under the company/person heading rather than duplicating those facts lower down. Example structure can include the lead/business address, Application address, and identity/opened data such as EIN, SSN, DOB, and Opened date when those real fields exist.
- Do not display the same fact twice on the middle panel.
- On the opposite/right side of the company title area, show a subtle light-gray summary band with no closed/heavy card border:
  - **Monthly Revenue** — the monthly revenue from the application, not annual revenue.
  - **Approval Amount** — the approved amount.
- The two labels should align side-by-side, with their amounts underneath. Amounts should be around the company-name size or slightly smaller, medium weight, not extra bold or oversized.

## 7. Contact section

- Contact is grouped in this order: **Mobile**, **Email**, **Landline**.
- Do not use labels such as Mobile 1, Mobile 2, Office, Ops, Personal, Kitchen, etc. as row labels.
- Show all real values under the appropriate group heading.
- Phone quick actions remain functional (call / message / WhatsApp where supported by the existing implementation).
- Quick-action icons should use a compact aligned action column with breathing room after the contact value. Do not glue icons directly to the number/email, and do not push them unnecessarily to the far edge leaving a large empty gap.
- For individual email rows, keep the working email action icon aligned consistently with the email address.
- Remove the text **Email All**.
- Put one visually distinct small envelope icon next to the **EMAIL** heading. It is the Email-All action and must open the real existing compose flow addressed to all actual email addresses for that lead.
- Contact must grow vertically for leads with more numbers/emails; do not clip normal data or force an internal contact-only scrollbar.

## 8. Contact + Company alignment

- Contact and Company form one paired top row.
- The shorter box/side must visually match the taller side on every lead so the pair always ends evenly aligned.
- The taller side determines the row height.
- Do not invent filler data merely to occupy space.
- If Contact is unusually tall, real EIN and/or SSN data may be placed in the Company side to use the space more intelligently, but those values must then be removed from the compact header summary so they are not duplicated.

## 9. Company section

- Keep only useful real company fields that are not duplicated in the header.
- Remove these lower Company fields: **Entity, Employees, Approval, Rep, Source**.
- Industry should display as one clean word/value when the source data supports that, e.g. `Catering`, not `Catering · 2 units`.
- If there is no DBA, hide the DBA label/value entirely and let the grid reflow; do not show a dash or empty placeholder.
- If a real Website exists in lead data or is returned by a real connected lookup, it may be shown as a clickable Website field. Do not pretend the CRM searched/found a website without a real lookup/integration.
- Address handling:
  - Do not repeat addresses already shown in the compact header.
  - If there is only one real address, show it only once.
  - If a bank statement contains a genuinely different address, show that distinct value as **Statement address**.
- Do not repeat the Opened/Start date lower down if it is already in the header summary.
- Annual revenue is not an application input. If Annual Revenue is shown, calculate it from the actual application monthly revenue as `monthly revenue × 12`; do not store or invent an unrelated value.

## 10. Statements + Bank Account row

- Directly below Contact + Company, create a second paired row: **Statements** on one side and **Bank Account** information on the other.
- These two sections should follow the same clean visual system as Contact + Company and align evenly as a row.
- Remove **Deposit Trend** completely.
- Remove **Balance Trend** completely.
- Do not keep separate trend UI/code remnants.

### Statements

- Present Statements as a clean, plain table similar to the user's reference image, not as nested cards.
- Columns: **Month | Deposits | Ending**.
- Show the **three most recent completed monthly statements**, newest first.
- **006 mock-data clarification:** for this demo build, the user explicitly approved adding a third completed statement as mock data for every lead. Those added June 2026 statement values/files are demo data only.
- If MTD data genuinely exists, add an **MTD row last** after the completed months.
- MTD must include the relevant MTD date/month label, deposits, and ending/current balance so columns stay aligned.
- Put a small monochrome outline PDF icon next to each statement month/title **only when a real scanned statement file exists for that row**.
- PDF icon style: empty interior, thin outline, folded top-right corner, not red.
- Clicking a statement PDF icon opens the associated scanned statement in the existing viewer.

### Bank Account

- Show the existing real bank/account information beside Statements in a clean aligned layout.
- Reuse/move useful existing bank information rather than duplicating it elsewhere.
- Do not add invented banking fields or values.

## 11. Files/Documents

- Remove the separate Files/Documents section from the middle panel.
- Application access moves to the Application PDF icon next to the company title.
- Statement access moves to the PDF icons beside the statement months.
- Do not show a document icon unless there is an actual associated file/viewer target.

## 12. Sales Pitch

- Below the Statements + Bank Account row, add **Sales Pitch**.
- Keep it short: about three sentences.
- It must be built from the lead's actual available CRM financial/business numbers and facts (for example monthly revenue, approval/request amount, statement deposits/balances, time in business, etc.).
- Do not fabricate financial facts.
- Do not pretend an AI service generated the pitch unless a real AI integration is connected. A deterministic local template based on the lead data is acceptable and should be the default implementation.
- Gracefully omit unavailable metrics rather than inserting fake placeholders.

## 13. Latest Activity

- Below Sales Pitch, show **Latest Activity**.
- Show the two most recent real activity entries expanded/visible by default.
- Older activity stays collapsed.
- Provide a working control to expand/show the remaining activity and collapse it again.
- Do not invent activity entries.

## 14. Middle-panel order and visual organization

Final middle-panel reading order:

1. Company header + compact identifying summary + Monthly Revenue / Approval Amount
2. Contact | Company
3. Statements | Bank Account
4. Sales Pitch
5. Latest Activity

- Keep sections aligned to consistent left edges and column grids.
- Use consistent spacing, headings, label colors, and value weights.
- Prefer breathing room, subtle separators, and restrained light-gray areas over many heavy bordered cards.
- Avoid confusing empty space, scattered floating controls, or unrelated alignment points.
- The middle panel must remain easy to scan even when Contact contains many phone numbers/emails.

## 15. Preserve existing behavior

Unless explicitly changed above, preserve the verified 004 behavior including:

- Sidebar and Forge dots.
- Lead search/filtering and lead selection.
- Communications tabs and message/call/email workflows already implemented.
- Dialer/keypad/call controls already implemented.
- Existing viewer/modal behavior.
- Device selector/status behavior.
- Panel resizing and saved widths.
- Settings that already perform real UI changes, including sidebar mode, lead-row spacing/density, and reduced motion.
- Blank non-Leads pages.

Do not add extra dashboard cards, status pills, fake integrations, fake searches, fake uploads, fake authentication, invented financial data, or unrelated redesigns.

## 16. Build workflow and deliverables

- Work in multiple logical phases.
- After each phase, briefly state what was completed and continue automatically; do not wait for approval unless a genuine blocker appears.
- Each phase follows build → audit → test → fix → verify.
- After all work is complete, audit every affected file and important workflow.
- The exact same final build must pass the required one clean final audit/test pass. If a final-pass issue is fixed, restart that final pass.
- Return both:
  1. a clean separated multi-file ZIP (primary development/source build), and
  2. a standalone single HTML containing the same finished CRM.
- Never overwrite the verified 004 build; use a new unique filename/version for the completed next build.
