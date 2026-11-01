import { useCallback, useEffect, useState } from "react";
import { Finished } from "./components/Finished";
import { Home } from "./components/Home";
import { Workshop } from "./components/Workshop";
import { ArtifactSelection } from "./components/ArtifactSelection";
import { appPathname, appUrl } from "./paths";
import {
  getArtifact,
  getLacquer,
  TARGET_ARTIFACT_ID,
  type LacquerColor,
} from "./artifacts";

type Page = "home" | "select" | "workshop" | "finished";

interface JourneyState {
  page: Page;
  artifactId: string | null;
  lacquer: LacquerColor | null;
  step: number;
  progress: number[];
  patternProgress: number;
  placed: string[];
  homeMessage?: string;
}

interface SavedJourney {
  artifactId: string | null;
  lacquer: LacquerColor | null;
  step: number;
  progress: number[];
  patternProgress: number;
  placed: string[];
}

const STORAGE_KEY = "mother-of-pearl-lacquer-journey-v1";

function makeProgress() {
  return Array.from({ length: 7 }, () => 0);
}

function isLacquerColor(value: unknown): value is LacquerColor {
  return typeof value === "string" && Boolean(getLacquer(value));
}

function readSavedJourney(): SavedJourney | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const saved = value as Partial<SavedJourney>;
    const artifact = saved.artifactId ? getArtifact(saved.artifactId) : undefined;
    const hasValidArtifact = saved.artifactId === null || Boolean(artifact);
    const hasValidLacquer = saved.lacquer === null || Boolean(getLacquer(saved.lacquer));
    if (
      !hasValidArtifact ||
      !hasValidLacquer ||
      typeof saved.step !== "number" ||
      !Number.isInteger(saved.step) ||
      !Array.isArray(saved.progress) ||
      saved.progress.length !== 7 ||
      !saved.progress.every((amount) => typeof amount === "number" && Number.isFinite(amount)) ||
      typeof saved.patternProgress !== "number" ||
      !Number.isFinite(saved.patternProgress) ||
      !Array.isArray(saved.placed) ||
      !saved.placed.every((id) => typeof id === "string")
    ) {
      return null;
    }
    return {
      artifactId: saved.artifactId === null ? null : artifact?.id ?? null,
      lacquer: saved.lacquer ?? null,
      step: Math.max(0, Math.min(6, saved.step)),
      progress: saved.progress.map((amount) => Math.max(0, Math.min(1, amount))),
      patternProgress: Math.max(0, Math.min(1, saved.patternProgress)),
      placed: saved.placed,
    };
  } catch (error) {
    console.error("Unable to read the saved lacquerware journey.", error);
    return null;
  }
}

function getInitialState(): JourneyState {
  const params = new URLSearchParams(window.location.search);
  const stored = readSavedJourney();
  const legacyArtifact = params.get("vessel") === "relic-bafang" ? TARGET_ARTIFACT_ID : null;
  const requestedArtifact = params.get("artifact") ?? legacyArtifact;
  const requestedLacquer = params.get("lacquer") ?? (
    params.get("color") === "black" ? "black" : params.get("color") === "red" ? "vermilion" : null
  );
  const pathname = appPathname();
  const isSelectPath = pathname === "/select";
  const isCraftPath = pathname === "/craft" || Boolean(legacyArtifact);
  const isFinishedPath = pathname === "/finished";
  const isJourneyPath = isCraftPath || isFinishedPath || Boolean(legacyArtifact);
  const requestedDefinition = getArtifact(requestedArtifact);
  const validRequest = Boolean(
    isJourneyPath &&
    requestedDefinition?.available &&
    requestedLacquer === "black",
  );
  const artifactId = validRequest ? requestedDefinition!.id : stored?.artifactId ?? null;
  const lacquer = validRequest ? requestedLacquer as LacquerColor : stored?.lacquer ?? null;
  const sameJourney = stored?.artifactId === artifactId && stored.lacquer === lacquer;
  const finishedIsUnlocked = Boolean(sameJourney && stored?.step === 6 && stored.progress[6] >= 0.85);
  const invalidJourneyRoute = isJourneyPath && !validRequest;

  return {
    page: validRequest
      ? isFinishedPath && finishedIsUnlocked ? "finished" : "workshop"
      : invalidJourneyRoute ? "select" : isSelectPath ? "select" : "home",
    artifactId,
    lacquer,
    step: sameJourney && stored ? stored.step : 0,
    progress: sameJourney && stored ? stored.progress : makeProgress(),
    patternProgress: sameJourney && stored ? stored.patternProgress : 0,
    placed: sameJourney && stored ? stored.placed : [],
    homeMessage: invalidJourneyRoute
      ? "制作地址缺少有效的文物或漆色参数，请在此重新选择。"
      : undefined,
  };
}

function getRouteUrl(page: Page, artifactId: string | null, lacquer: LacquerColor | null) {
  if (page === "home") return appUrl("/");
  if (page === "select") return appUrl("/select");
  if (!artifactId || !lacquer) return appUrl("/select");
  const params = new URLSearchParams({ artifact: artifactId, lacquer });
  return appUrl(`/${page === "finished" ? "finished" : "craft"}`, `?${params.toString()}`);
}

export default function App() {
  const [journey, setJourney] = useState<JourneyState>(getInitialState);
  const artifact = getArtifact(journey.artifactId);
  const canEnterWorkshop = Boolean(artifact?.available && journey.lacquer === "black");
  const finishedUnlocked = Boolean(journey.step === 6 && journey.progress[6] >= 0.85);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved: SavedJourney = {
        artifactId: journey.artifactId,
        lacquer: journey.lacquer,
        step: journey.step,
        progress: journey.progress,
        patternProgress: journey.patternProgress,
        placed: journey.placed,
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (error) {
        console.error("Unable to save the lacquerware journey.", error);
      }
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [journey.artifactId, journey.lacquer, journey.step, journey.progress, journey.patternProgress, journey.placed]);

  useEffect(() => {
    const syncRoute = () => setJourney(getInitialState());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function navigate(page: Page, next: Partial<JourneyState> = {}) {
    const target = { ...journey, ...next, page };
    window.history.pushState({ page }, "", getRouteUrl(page, target.artifactId, target.lacquer));
    setJourney(target);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updateProgress(index: number, value: number) {
    setJourney((current) => ({
      ...current,
      progress: current.progress.map((amount, stage) =>
        stage === index ? Math.max(amount, Math.min(1, value)) : amount,
      ),
    }));
  }

  function restartStep(index: number) {
    if (index === 0) {
      setJourney((current) => ({ ...current, patternProgress: 0 }));
    } else if (index === 2) {
      setJourney((current) => ({ ...current, placed: [] }));
    } else {
      setJourney((current) => ({
        ...current,
        progress: current.progress.map((amount, stage) => stage === index ? 0 : amount),
      }));
    }
  }

  const updatePatternProgress = useCallback((value: number) => {
    setJourney((current) => ({
      ...current,
      patternProgress: Math.max(current.patternProgress, Math.min(1, value)),
    }));
  }, []);

  function placeShell(motifId: string) {
    setJourney((current) => current.placed.includes(motifId)
      ? current
      : { ...current, placed: [...current.placed, motifId] });
  }

  function returnHome() {
    navigate("home", { homeMessage: undefined });
  }

  function returnToSelection(message?: string) {
    navigate("select", { homeMessage: message });
  }

  function confirmArtifact() {
    const selected = getArtifact(journey.artifactId);
    if (!selected?.available || !isLacquerColor(journey.lacquer) || journey.lacquer !== "black") {
      setJourney((current) => ({
        ...current,
        homeMessage: !current.artifactId || !current.lacquer
          ? "请先选择历史文物和漆色，再确认器型。"
          : current.lacquer !== "black"
          ? "当前七步工艺图片仅有漆黑版本，请选择漆黑后继续。"
          : "该器型的七步制作素材尚未接入，请选择已接入真实盘面素材的八方盘。",
      }));
      return;
    }
    navigate("workshop", {
      step: journey.step,
      homeMessage: undefined,
    });
  }

  function confirmFromFlow() {
    if (!journey.artifactId || !journey.lacquer) {
      navigate("select", { homeMessage: "请先选择历史文物与漆色，再确认器型。" });
      return;
    }
    if (!canEnterWorkshop) {
      navigate("select", {
        homeMessage: journey.lacquer !== "black"
          ? "当前七步工艺图片仅有漆黑版本，请选择漆黑后继续。"
          : "该器型的七步制作素材尚未接入，请选择已接入真实盘面素材的八方盘。",
      });
      return;
    }
    confirmArtifact();
  }

  function enterWorkshopFromFlow() {
    if (!canEnterWorkshop) {
      navigate("select", {
        homeMessage: !journey.artifactId || !journey.lacquer
          ? "请先选择历史文物与漆色，再进入七步制作。"
          : "当前选择尚未接入七步制作素材，请选择漆黑八方盘。",
      });
      return;
    }
    navigate("workshop", { homeMessage: undefined });
  }

  function openFinishedFromFlow() {
    if (finishedUnlocked && artifact && journey.lacquer) {
      navigate("finished");
      return;
    }
    if (canEnterWorkshop) {
      navigate("workshop", { homeMessage: undefined });
      return;
    }
    navigate("select", {
      homeMessage: "请先选择已接入的漆黑八方盘并完成七道工序，再进入成品展示。",
    });
  }

  function selectArtifact(artifactId: string) {
    setJourney((current) => current.artifactId === artifactId
      ? { ...current, homeMessage: undefined }
      : {
          ...current,
          artifactId,
          step: 0,
          progress: makeProgress(),
          patternProgress: 0,
          placed: [],
          homeMessage: undefined,
        });
  }

  function selectLacquer(lacquer: LacquerColor) {
    setJourney((current) => current.lacquer === lacquer
      ? current
      : {
          ...current,
          lacquer,
          step: 0,
          progress: makeProgress(),
          patternProgress: 0,
          placed: [],
        });
  }

  function restart() {
    const target = {
      ...journey,
      page: "workshop" as const,
      step: 0,
      progress: makeProgress(),
      patternProgress: 0,
      placed: [],
    };
    window.history.pushState({ page: "workshop" }, "", getRouteUrl("workshop", target.artifactId, target.lacquer));
    setJourney(target);
  }

  return (
    <div className="app-shell">
      {journey.page === "home" && (
        <Home
          selectionSummary={artifact && journey.lacquer
            ? `${artifact.name} · ${getLacquer(journey.lacquer)?.label ?? journey.lacquer}`
            : "选择未完成"}
          hasSelection={Boolean(journey.artifactId && journey.lacquer)}
          canEnterWorkshop={canEnterWorkshop}
          finishedUnlocked={finishedUnlocked}
          onStart={() => navigate("select", { homeMessage: undefined })}
          onConfirm={confirmFromFlow}
          onEnterWorkshop={enterWorkshopFromFlow}
          onOpenFinished={openFinishedFromFlow}
        />
      )}
      {journey.page === "select" && (
        <ArtifactSelection
          artifactId={journey.artifactId}
          lacquer={journey.lacquer}
          message={journey.homeMessage}
          onSelectArtifact={selectArtifact}
          onSelectLacquer={selectLacquer}
          onConfirm={confirmArtifact}
          onHome={returnHome}
        />
      )}
      {journey.page === "workshop" && artifact && journey.lacquer && (
        <Workshop
          step={journey.step}
          progress={journey.progress}
          patternProgress={journey.patternProgress}
          placed={journey.placed}
          artifactName={artifact.name}
          lacquerName={journey.lacquer === "black" ? "漆黑" : "朱红"}
          onSelectStep={(step) => setJourney((current) => ({ ...current, step }))}
          onProgress={updateProgress}
          onPatternProgress={updatePatternProgress}
          onResetPatternProgress={() => setJourney((current) => ({ ...current, patternProgress: 0 }))}
          onRestartStep={restartStep}
          onPlaceShell={placeShell}
          onFinish={() => navigate("finished")}
          onHome={returnHome}
          onBackToSelection={() => returnToSelection()}
        />
      )}
      {journey.page === "finished" && artifact && journey.lacquer && (
        <Finished
          placed={journey.placed}
          progress={journey.progress}
          patternProgress={journey.patternProgress}
          artifactName={artifact.name}
          lacquerName={journey.lacquer === "black" ? "漆黑" : "朱红"}
          onRestart={restart}
          onHome={returnHome}
          onReselect={() => returnToSelection()}
        />
      )}
    </div>
  );
}
