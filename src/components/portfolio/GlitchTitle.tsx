import "./glitch.css";

export function GlitchTitle({ text }: { text: string }) {
  return (
    <span className="glitch" data-text={text}>
      {text}
    </span>
  );
}
