# Apple hello lettering

Original SVG exports from the user-supplied Figma design:
https://www.figma.com/design/pXSd48CVS9N1u8bM2vRxPA/Official-Apple-Hello-Lettering--Community-

- English: `hello-en`, node `1:777`, vector group `1:778`; 2 paths.
- Simplified Chinese: `hello-zh-Hans`, node `1:511`, vector group `1:512`; 9 paths.
- Exported 2026-09-10. SVG bytes are preserved as downloaded.

The Figma parent vertically flips both vector groups. The application reproduces
that transform, fits the artwork at the right edge, and animates the original
paths in export order. Duration is proportional to each path's measured length.
No font substitution, outline tracing, or raster images are used.

On 2026-09-11 the user manually exported the remaining 35 locale SVGs from
Figma, bringing the rotation to 37 locales. These exports are already upright;
only the original English and Simplified Chinese group exports use `flipY`.
All exports retain open white stroke paths for sequential handwriting animation.
The runtime preserves aspect ratio and owns the initialized SVG subtree so React
playback updates cannot replace the path animation attributes.
