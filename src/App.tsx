import { useState } from "react";
import table1Data from "./data/table1.json";
import ParchmentButton from "./components/ParchmentButton"; // ⬅️ NEW

// Types to help TS
type SlimeDef = { id: string; name: string; icon: string };
type OwnedSlime = { id: string; usage: "Yes" | "No"; maxLevel: number };


// === Slime Icons ===
import ArpIcon from "./assets/slimes/Arp.png";
import YulissaIcon from "./assets/slimes/Yulissa.png";
import VeinleyIcon from "./assets/slimes/Veinley.png";
import WillerIcon from "./assets/slimes/Willer.png";
import YanaIcon from "./assets/slimes/Yana.png";
import YsabelleIcon from "./assets/slimes/Ysabelle.png";
import YamiletIcon from "./assets/slimes/Yamilet.png";
import ChilbertIcon from "./assets/slimes/Chilbert.png";
import SullyIcon from "./assets/slimes/Sully.png";
import MaggieIcon from "./assets/slimes/Maggie.png";
import DoraksIcon from "./assets/slimes/Doraks.png";
import YolandaIcon from "./assets/slimes/Yolanda.png";
import VinomeraIcon from "./assets/slimes/Vinomera.png";
import VulcayenIcon from "./assets/slimes/Vulcayen.png";
import MasterHakuIcon from "./assets/slimes/MasterHaku.png";
import SolaxIcon from "./assets/slimes/Solax.png";
import LunaxIcon from "./assets/slimes/Lunax.png";
import SilasIcon from "./assets/slimes/Silas.png";
import WynneIcon from "./assets/slimes/Wynne.png";
import NeprusIcon from "./assets/slimes/Neprus.png";
import ChlorisIcon from "./assets/slimes/Chloris.png";
import FeyriaIcon from "./assets/slimes/Feyria.png";

// === Background ===
import Background from "./assets/battlefield.png"; // TODO: replace with your knights-with-slime image  DONE



// === Slime Definitions ===
const slimes = [
    { id: "arp", name: "Arp", icon: ArpIcon },
    { id: "yulissa", name: "Yulissa", icon: YulissaIcon },
    { id: "veinley", name: "Veinley", icon: VeinleyIcon },
    { id: "willer", name: "Willer", icon: WillerIcon },
    { id: "yana", name: "Yana", icon: YanaIcon },
    { id: "ysabelle", name: "Ysabelle", icon: YsabelleIcon },
    { id: "yamilet", name: "Yamilet", icon: YamiletIcon },
    { id: "chilbert", name: "Chilbert", icon: ChilbertIcon },
    { id: "sully", name: "Sully", icon: SullyIcon },
    { id: "maggie", name: "Maggie", icon: MaggieIcon },
    { id: "doraks", name: "Doraks", icon: DoraksIcon },
    { id: "yolanda", name: "Yolanda", icon: YolandaIcon },
    { id: "vinomera", name: "Vinomera", icon: VinomeraIcon },
    { id: "vulcayen", name: "Vulcayen", icon: VulcayenIcon },
    { id: "masterhaku", name: "Master Haku", icon: MasterHakuIcon },
    { id: "solax", name: "Solax", icon: SolaxIcon },
    { id: "lunax", name: "Lunax", icon: LunaxIcon },
    { id: "silas", name: "Silas", icon: SilasIcon },
    { id: "wynne", name: "Wynne", icon: WynneIcon },
    { id: "neprus", name: "Neprus", icon: NeprusIcon },
    { id: "chloris", name: "Chloris", icon: ChlorisIcon },
    { id: "feyria", name: "Feyria", icon: FeyriaIcon },
];
// --- helpers for matching & ordering ---
const idByName = new Map(slimes.map(s => [s.name.toLowerCase(), s.id]));

// === Helper: calculate total boost === ⬅️ NEW
function calculateTotalBoost(
    recLevels: Record<string, { recommendedLevel: number; maxLevel: number }>
): number {
    let total = 0;

    for (const slimeId in recLevels) {
        const rec = recLevels[slimeId];

        // Find the BoostPerLevel for this slime (any row will do, since it’s constant per slime)
        const row = table1Data.find(r => toSlimeIdFromTable(r.Slime) === slimeId);
        if (!row || !row.BoostPerLevel) continue;

        const boostPerLevel = row.BoostPerLevel;
        const boost = rec.recommendedLevel * boostPerLevel;

        total += boost;
    }

    return total;
}


// === Helper: calculate recommended levels ===
function calculateRecommendedLevels(
    xpBudget: number,
    ownedSlimes: OwnedSlime[]
) {
    const ownedById = new Map(ownedSlimes.map(s => [s.id, s]));

    const recLevels: Record<string, { recommendedLevel: number; maxLevel: number }> = {};
    let remaining = xpBudget;

    // Initialize all owned slimes at Level 1
    for (const s of ownedSlimes) {
        recLevels[s.id] = { recommendedLevel: 1, maxLevel: s.maxLevel };
    }

    // === Phase 1: Max priority for Usage=Yes ===
    for (const r of table1Data) {
        const slimeId = toSlimeIdFromTable(r.Slime);
        const s = ownedById.get(slimeId);
        if (!s) continue;
        if (s.usage !== "Yes") continue;
        if (r.Level > s.maxLevel) continue;

        const cost = r.CostToLevelUp || 0;
        if (remaining >= cost) {
            remaining -= cost;
            recLevels[slimeId].recommendedLevel = r.Level; // set, not increment
        } else {
            break;
        }
    }

    // === Phase 2: Distribute remaining XP across others ===
    for (const r of table1Data) {
        const slimeId = toSlimeIdFromTable(r.Slime);
        const s = ownedById.get(slimeId);
        if (!s) continue;
        if (s.usage === "Yes") continue;
        if (r.Level > s.maxLevel) continue;

        const cost = r.CostToLevelUp || 0;
        if (remaining >= cost) {
            remaining -= cost;
            recLevels[slimeId].recommendedLevel = r.Level; // set, not increment
        } else {
            break;
        }
    }

    return recLevels;
}





/** Map a Table1 "Slime" cell to our internal id ("arp", "masterhaku", etc). */
function toSlimeIdFromTable(name: string): string {
    const direct = idByName.get(name.toLowerCase());
    if (direct) return direct;
    // Fallback: normalize (remove non-alnum, lowercase)
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}



export default function App() {
    // === Screen control ===
    const [screen, setScreen] = useState(1);

    // === State for XP input ===
    const [xpBudget, setXpBudget] = useState("");

    // === State for slime selection ===
    const [ownedSlimes, setOwnedSlimes] = useState<OwnedSlime[]>([]);

    // === State for results ===
    const [results, setResults] = useState<Record<string, { recommendedLevel: number; maxLevel: number }>>({});
    const [totalBoost, setTotalBoost] = useState(0); //

    // === Modal state for the parchment GUI ===
    const [pendingSlime, setPendingSlime] = useState<SlimeDef | null>(null);
    const [step, setStep] = useState<"ownPrompt" | "maxPrompt" | "chooseLevel">("ownPrompt");
    const [pendingUsage, setPendingUsage] = useState<"Yes" | "No">("No");



    // === Handlers ===
    const handleContinue = () => {
        if (Number(xpBudget) > 0) setScreen(2);
    };

    const handleSelectSlime = (slime: SlimeDef) => {
        setPendingSlime(slime);
        setStep("ownPrompt");
        setPendingUsage("No");
    };



    const handleCalculate = () => {
        const calc = calculateRecommendedLevels(Number(xpBudget), ownedSlimes);
        setResults(calc);
        // also compute total boost ⬅️ NEW
        const boost = calculateTotalBoost(calc);
        setTotalBoost(boost);

        setScreen(3);
    };

    // === Screen 1: XP Input ===
    if (screen === 1) {
        return (
            <div
                className="h-screen w-screen flex flex-col items-center justify-center text-white"
                style={{
                    backgroundImage: `url(${Background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="bg-black bg-opacity-70 p-6 rounded-2xl shadow-xl text-center max-w-lg">
                    <h1 className="text-2xl mb-4">De-level all of your owned slimes to level 1.</h1>
                    <p className="mb-4">How much XP do you have?</p>

                    <input
                        type="text"
                        inputMode="numeric"   // mobile: force numeric keypad
                        value={xpBudget}
                        onChange={(e) => {
                            let value = e.target.value.replace(/\D+/g, "");   // allow only digits
                            value = value.replace(/^0+(?!$)/, "");            // trim leading zeros
                            setXpBudget(value);
                        }}
                        placeholder="Enter XP..."
                        className="px-3 py-2 rounded-lg text-black w-full mb-4"
                    />

                    <button
                        onClick={handleContinue}
                        disabled={!xpBudget} // disable button until XP entered
                        className={`px-6 py-2 rounded-xl shadow ${xpBudget
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-500 cursor-not-allowed"
                            }`}
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        );
    }


    // === Screen 2: Slime Selection ===
    if (screen === 2) {
        return (
            <div
                className="min-h-screen w-screen text-white p-6"
                style={{
                    backgroundImage: `url(${Background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Select Your Slimes</h2>
                    <button
                        onClick={handleCalculate}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl shadow"
                    >
                        CALCULATE
                    </button>
                </div>

                {/* Slime grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                    {slimes.map((slime) => {
                        const owned = ownedSlimes.find((s) => s.id === slime.id);
                        return (
                            <div
                                key={slime.id}
                                onClick={() => handleSelectSlime(slime)}
                                className={`cursor-pointer rounded-xl text-center transition border-4 flex flex-col items-center w-28 p-3 shadow-md ${owned
                                        ? "border-green-400 bg-black bg-opacity-50"
                                        : "border-transparent bg-black bg-opacity-30"
                                    }`}
                            >
                                <img src={slime.icon} alt={slime.name} className="w-16 h-16 mx-auto mb-2" />
                                <p>{slime.name}</p>
                                {owned && <p className="text-sm">Max {owned.maxLevel}</p>}
                            </div>
                        );
                    })}
                </div>

                {/* === Parchment Modal (in-GUI prompts) === */}
                {pendingSlime && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                        <div className="bg-white p-6 rounded-xl text-center max-w-md mx-auto">
                            <h3 className="font-medieval text-2xl mb-4 text-black">
                                {pendingSlime.name}
                            </h3>

                            {/* Step 1: Own? */}
                            {step === "ownPrompt" && (
                                <>
                                    <p className="mb-2 text-black">Do you own this slime?</p>
                                    <div className="flex gap-4 justify-center">
                                        <ParchmentButton
                                            text="Yes"
                                            onClick={() => setStep("maxPrompt")}
                                        />
                                        <ParchmentButton
                                            text="No"
                                            onClick={() => {
                                                // Remove if it was owned; otherwise just close
                                                setOwnedSlimes((prev) => prev.filter((s) => s.id !== pendingSlime.id));
                                                setPendingSlime(null);
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Step 2: Want at maximum? */}
                            {step === "maxPrompt" && (
                                <>
                                    <p className="mb-2 text-black">
                                        Do you want this slime at its maximum level?
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <ParchmentButton
                                            text="Yes"
                                            onClick={() => {
                                                setPendingUsage("Yes");
                                                setStep("chooseLevel");
                                            }}
                                        />
                                        <ParchmentButton
                                            text="No"
                                            onClick={() => {
                                                setPendingUsage("No");
                                                setStep("chooseLevel");
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Step 3: Choose Max Level */}
                            {step === "chooseLevel" && (
                                <>
                                    <p className="mb-2 text-black">
                                        What is this slime&apos;s current Maximum Level?
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[100, 125, 150, 175, 200, 225, 250].map((lvl) => (
                                            <ParchmentButton
                                                key={lvl}
                                                text={String(lvl)}
                                                onClick={() => {
                                                    setOwnedSlimes((prev) => {
                                                        const exists = prev.find((s) => s.id === pendingSlime.id);
                                                        if (exists) {
                                                            // update
                                                            return prev.map((s) =>
                                                                s.id === pendingSlime.id
                                                                    ? { ...s, usage: pendingUsage, maxLevel: lvl }
                                                                    : s
                                                            );
                                                        }
                                                        // add new
                                                        return [
                                                            ...prev,
                                                            { id: pendingSlime.id, usage: pendingUsage, maxLevel: lvl },
                                                        ];
                                                    });
                                                    setPendingSlime(null);
                                                    setStep("ownPrompt");
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        );
    }



    // === Screen 3: Results ===
    if (screen === 3) {
        return (
            <div
                className="min-h-screen w-screen text-white p-6"
                style={{
                    backgroundImage: `url(${Background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <h2 className="text-2xl mb-6">Recommended Levels</h2>
                {/* Total Boost Box ⬅️ NEW */}
                <div className="bg-yellow-200 text-black rounded-2xl px-6 py-3 mb-6 shadow-lg border-4 border-yellow-400 text-center font-bold text-lg max-w-sm">
                    All Slime Bonus: +{totalBoost.toFixed(2)}%
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                    {ownedSlimes.map((slime) => {
                        const result = results[slime.id];
                        const def = slimes.find((s) => s.id === slime.id); // <-- get SlimeDef info
                        if (!def) return null;

                        return (
                            <div key={slime.id} className="p-2 rounded-xl text-center border-4 border-yellow-400 bg-black bg-opacity-60">
                                <img src={def.icon} alt={def.name} className="w-20 h-20 mx-auto mb-2" />
                                <p>{def.name}</p>
                                {result && (
                                    <p className="text-sm">
                                        {result.recommendedLevel}/{result.maxLevel}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
