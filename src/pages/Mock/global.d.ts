declare module "lottie-web" {
  import { AnimationItem } from "lottie-web";
  const lottie: any;
  export default lottie;
  export type { AnimationItem };
}

interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
