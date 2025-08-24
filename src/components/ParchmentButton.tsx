// src/components/ParchmentButton.tsx
import parchment from "../assets/buttons/parchment.png"; // <-- put the PNG here

type ParchmentButtonProps = {
    text: string;
    onClick: () => void;
    className?: string;
};

export default function ParchmentButton({ text, onClick, className }: ParchmentButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`relative font-medieval text-lg text-black flex items-center justify-center ${className || ""}`}
            style={{
                backgroundImage: `url(${parchment})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "180px",
                height: "64px",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
            }}
        >
            {text}
        </button>
    );
}
