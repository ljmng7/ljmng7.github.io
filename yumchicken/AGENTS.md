# Project Instructions

## Browser verification

优先使用内置浏览器；只有在内置浏览器无法完成所需验证时，才使用 Playwright。

Feature titles use one centered title area above the cards. Show only the current title at rest; derive nonlinear title fades and horizontal motion from actual carousel scrolling so outgoing text follows the cards and incoming text fades in in sync, including native gestures. Preserve the five-second clock and existing media behavior.

Feature videos keep their sources mounted with preload="auto" from initial page load, independent of carousel visibility. Playback still starts on entering view. On mobile, English feature titles break after punctuation; Chinese wrapping remains unchanged.

Features use four numbered videos (recipe details, Cook Along, ingredient selection, and sharing), followed by a multi-device image, with localized titles. The homepage keeps its four-video playlist. Preserve the existing carousel timing. Strip audio without re-encoding video; preload from mount, mute inline playback, and disable remote playback and picture-in-picture.

Footer wordmarks are hidden at widths up to 640px. On desktop, scale them to the available center width with room reserved for the appearance/language controls and by Jazmin credit. Do not restore the 641–1120px wordmark enlargement or its height compensation.
