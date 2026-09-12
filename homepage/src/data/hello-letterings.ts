import svgen from "../assets/apple-hello/hello-en.svg?raw";
import svgzhHans from "../assets/apple-hello/hello-zh-Hans.svg?raw";
import svgar from "../assets/apple-hello/hello-ar.svg?raw";
import svgbg from "../assets/apple-hello/hello-bg.svg?raw";
import svgca from "../assets/apple-hello/hello-ca.svg?raw";
import svgcs from "../assets/apple-hello/hello-cs.svg?raw";
import svgda from "../assets/apple-hello/hello-da.svg?raw";
import svgde from "../assets/apple-hello/hello-de.svg?raw";
import svgel from "../assets/apple-hello/hello-el.svg?raw";
import svges from "../assets/apple-hello/hello-es.svg?raw";
import svgfi from "../assets/apple-hello/hello-fi.svg?raw";
import svgfr from "../assets/apple-hello/hello-fr.svg?raw";
import svghe from "../assets/apple-hello/hello-he.svg?raw";
import svghi from "../assets/apple-hello/hello-hi.svg?raw";
import svghr from "../assets/apple-hello/hello-hr.svg?raw";
import svghu from "../assets/apple-hello/hello-hu.svg?raw";
import svgid from "../assets/apple-hello/hello-id.svg?raw";
import svgit from "../assets/apple-hello/hello-it.svg?raw";
import svgja from "../assets/apple-hello/hello-ja.svg?raw";
import svgkk from "../assets/apple-hello/hello-kk.svg?raw";
import svgko from "../assets/apple-hello/hello-ko.svg?raw";
import svgms from "../assets/apple-hello/hello-ms.svg?raw";
import svgnb from "../assets/apple-hello/hello-nb.svg?raw";
import svgnl from "../assets/apple-hello/hello-nl.svg?raw";
import svgpl from "../assets/apple-hello/hello-pl.svg?raw";
import svgpt from "../assets/apple-hello/hello-pt.svg?raw";
import svgptBR from "../assets/apple-hello/hello-pt_BR.svg?raw";
import svgro from "../assets/apple-hello/hello-ro.svg?raw";
import svgru from "../assets/apple-hello/hello-ru.svg?raw";
import svgsk from "../assets/apple-hello/hello-sk.svg?raw";
import svgsv from "../assets/apple-hello/hello-sv.svg?raw";
import svgth from "../assets/apple-hello/hello-th.svg?raw";
import svgtr from "../assets/apple-hello/hello-tr.svg?raw";
import svguk from "../assets/apple-hello/hello-uk.svg?raw";
import svgvi from "../assets/apple-hello/hello-vi.svg?raw";
import svgzhHant from "../assets/apple-hello/hello-zh-Hant.svg?raw";
import svgzhHK from "../assets/apple-hello/hello-zh_HK.svg?raw";

export type HelloLettering = {
  language: string;
  viewBox: [number, number, number, number];
  svg: string;
  flipY: boolean;
};

// English opens the introduction, followed by Simplified Chinese and all other
// supplied locales. The original two group exports need a vertical flip;
// the subsequent manual exports already include the correct orientation.
export const helloLetterings: HelloLettering[] = [
  { language: "en", viewBox: [0, 0, 636.247, 199.793], svg: svgen, flipY: true },
  { language: "zh-Hans", viewBox: [0, 0, 490.304, 219.855], svg: svgzhHans, flipY: true },
  { language: "ar", viewBox: [0, 0, 558, 226], svg: svgar, flipY: false },
  { language: "bg", viewBox: [0, 0, 942, 275], svg: svgbg, flipY: false },
  { language: "ca", viewBox: [0, 0, 562, 200], svg: svgca, flipY: false },
  { language: "cs", viewBox: [0, 0, 512, 276], svg: svgcs, flipY: false },
  { language: "da", viewBox: [0, 0, 384, 276], svg: svgda, flipY: false },
  { language: "de", viewBox: [0, 0, 668, 200], svg: svgde, flipY: false },
  { language: "el", viewBox: [0, 0, 848, 246], svg: svgel, flipY: false },
  { language: "es", viewBox: [0, 0, 562, 200], svg: svges, flipY: false },
  { language: "fi", viewBox: [0, 0, 374, 201], svg: svgfi, flipY: false },
  { language: "fr", viewBox: [0, 0, 948, 279], svg: svgfr, flipY: false },
  { language: "he", viewBox: [0, 0, 408, 216], svg: svghe, flipY: false },
  { language: "hi", viewBox: [0, 0, 605, 273], svg: svghi, flipY: false },
  { language: "hr", viewBox: [0, 0, 1218, 203], svg: svghr, flipY: false },
  { language: "hu", viewBox: [0, 0, 638, 200], svg: svghu, flipY: false },
  { language: "id", viewBox: [0, 0, 570, 201], svg: svgid, flipY: false },
  { language: "it", viewBox: [0, 0, 500, 200], svg: svgit, flipY: false },
  { language: "ja", viewBox: [0, 0, 878, 200], svg: svgja, flipY: false },
  { language: "kk", viewBox: [0, 0, 732, 200], svg: svgkk, flipY: false },
  { language: "ko", viewBox: [0, 0, 1138, 264], svg: svgko, flipY: false },
  { language: "ms", viewBox: [0, 0, 540, 200], svg: svgms, flipY: false },
  { language: "nb", viewBox: [0, 0, 374, 200], svg: svgnb, flipY: false },
  { language: "nl", viewBox: [0, 0, 668, 200], svg: svgnl, flipY: false },
  { language: "pl", viewBox: [0, 0, 610, 200], svg: svgpl, flipY: false },
  { language: "pt", viewBox: [0, 0, 382, 200], svg: svgpt, flipY: false },
  { language: "pt-BR", viewBox: [0, 0, 382, 200], svg: svgptBR, flipY: false },
  { language: "ro", viewBox: [0, 0, 664, 200], svg: svgro, flipY: false },
  { language: "ru", viewBox: [0, 0, 924, 264], svg: svgru, flipY: false },
  { language: "sk", viewBox: [0, 0, 512, 276], svg: svgsk, flipY: false },
  { language: "sv", viewBox: [0, 0, 384, 276], svg: svgsv, flipY: false },
  { language: "th", viewBox: [0, 0, 700, 272], svg: svgth, flipY: false },
  { language: "tr", viewBox: [0, 0, 1050, 203], svg: svgtr, flipY: false },
  { language: "uk", viewBox: [0, 0, 899, 264], svg: svguk, flipY: false },
  { language: "vi", viewBox: [0, 0, 1009, 200], svg: svgvi, flipY: false },
  { language: "zh-Hant", viewBox: [0, 0, 462, 237], svg: svgzhHant, flipY: false },
  { language: "zh-HK", viewBox: [0, 0, 466, 221], svg: svgzhHK, flipY: false },
];
