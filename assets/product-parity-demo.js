(() => {
  "use strict";

  const earlyAccessUrl = "https://yberium.github.io/venuebrief-landing/early-access.html";
  const stages = [...document.querySelectorAll("[data-stage]")];
  const journey = [...document.querySelectorAll("[data-journey]")];
  const methodButtons = [...document.querySelectorAll("[data-method]")];
  const intakePanels = [...document.querySelectorAll("[data-intake-panel]")];
  const backButton = document.getElementById("back-button");
  const primaryButton = document.getElementById("primary-button");
  const actionTitle = document.getElementById("action-title");
  const actionDetail = document.getElementById("action-detail");
  const readinessValue = document.getElementById("readiness-value");
  const readinessLabel = document.getElementById("readiness-label");
  const statusPeople = document.getElementById("status-people");
  const statusSafe = document.getElementById("status-safe");
  const statusDecisions = document.getElementById("status-decisions");
  const repairTitle = document.getElementById("repair-title");
  const repairLead = document.getElementById("repair-lead");
  const repairBadge = document.getElementById("repair-badge");
  const repairSummary = document.getElementById("repair-summary");
  const managerDecision = document.getElementById("manager-decision");
  const readyPanel = document.getElementById("ready-panel");
  const briefPrivateOwner = document.getElementById("brief-private-owner");
  const relayPrivateOwner = document.getElementById("relay-private-owner");
  const toast = document.getElementById("toast");

  let stage = 1;
  let method = "voice";
  let safeFixesApplied = false;
  let managerOwner = "";
  let toastTimer;
  let recognition;

  const stageCopy = {
    1: {
      title: "Add today’s rota",
      detail: "Choose scan, voice, text or venue setup.",
      button: "Build sample shift",
      readiness: "Not started",
      label: "Choose an input method",
      people: "—",
      safe: "—",
      decisions: "—"
    },
    2: {
      title: "Review the AI proposal",
      detail: "Nothing is applied until the manager continues.",
      button: "Verify with Readiness Core",
      readiness: "Proposal",
      label: "Manager review",
      people: "5",
      safe: "—",
      decisions: "—"
    },
    3: {
      title: "Verify deterministic issues",
      detail: "Two safe fixes and one manager decision.",
      button: "Preview automatic fixes",
      readiness: "Not ready",
      label: "3 material issues",
      people: "5",
      safe: "2",
      decisions: "1"
    },
    4: {
      title: "Repair the shift",
      detail: "Apply safe fixes, then make the remaining decision.",
      button: "Apply 2 safe fixes",
      readiness: "Fixing",
      label: "Preview changes",
      people: "5",
      safe: "2",
      decisions: "1"
    },
    5: {
      title: "Use the reviewed outputs",
      detail: "Pulse Brief and Pulse Relay match the verified plan.",
      button: "Request early access",
      readiness: "Ready",
      label: "Verified plan",
      people: "5",
      safe: "0",
      decisions: "0"
    }
  };

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function selectedOwner() {
    return document.querySelector('input[name="private-dining-owner"]:checked')?.value || "";
  }

  function updateRepairState() {
    if (stage !== 4) return;
    managerOwner = selectedOwner();

    if (!safeFixesApplied) {
      repairTitle.textContent = "Review the two safe changes before applying.";
      repairLead.textContent = "Pulse previews every deterministic autofix. The plan changes only after the manager presses Apply.";
      repairBadge.textContent = "Preview";
      repairBadge.className = "stage-badge";
      repairSummary.hidden = false;
      managerDecision.hidden = true;
      readyPanel.hidden = true;
      primaryButton.disabled = false;
      primaryButton.textContent = "Apply 2 safe fixes";
      actionTitle.textContent = "Repair the shift";
      actionDetail.textContent = "Only deterministic safe changes can be applied automatically.";
      readinessValue.textContent = "Fixing";
      readinessLabel.textContent = "Preview changes";
      statusSafe.textContent = "2";
      statusDecisions.textContent = "1";
      return;
    }

    repairSummary.hidden = false;
    managerDecision.hidden = false;
    if (!managerOwner) {
      repairTitle.textContent = "Two safe fixes applied. One manager decision remains.";
      repairLead.textContent = "Pulse has resolved only the changes that passed the deterministic safety rules.";
      repairBadge.textContent = "Manager decision";
      repairBadge.className = "stage-badge warning";
      readyPanel.hidden = true;
      primaryButton.disabled = true;
      primaryButton.textContent = "Confirm manager decision";
      actionTitle.textContent = "Choose the Private Dining owner";
      actionDetail.textContent = "Software will not choose between two valid operational options.";
      readinessValue.textContent = "Manager check";
      readinessLabel.textContent = "1 decision remains";
      statusSafe.textContent = "0";
      statusDecisions.textContent = "1";
      return;
    }

    repairTitle.textContent = "The shift now passes the readiness checks.";
    repairLead.textContent = `${managerOwner} is confirmed for Private Dining. The reviewed plan is ready to communicate.`;
    repairBadge.textContent = "Ready";
    repairBadge.className = "stage-badge ready";
    readyPanel.hidden = false;
    primaryButton.disabled = false;
    primaryButton.textContent = "Generate outputs";
    actionTitle.textContent = "Operational decisions complete";
    actionDetail.textContent = "Generate Pulse Brief and Pulse Relay from this exact plan.";
    readinessValue.textContent = "Ready";
    readinessLabel.textContent = "Verified plan";
    statusSafe.textContent = "0";
    statusDecisions.textContent = "0";
  }

  function renderStage({ scroll = true } = {}) {
    stages.forEach(node => { node.hidden = Number(node.dataset.stage) !== stage; });
    journey.forEach(node => {
      const value = Number(node.dataset.journey);
      node.dataset.state = value === stage ? "active" : value < stage ? "complete" : "pending";
    });

    const copy = stageCopy[stage];
    actionTitle.textContent = copy.title;
    actionDetail.textContent = copy.detail;
    primaryButton.textContent = copy.button;
    primaryButton.disabled = false;
    backButton.disabled = stage === 1;
    readinessValue.textContent = copy.readiness;
    readinessLabel.textContent = copy.label;
    statusPeople.textContent = copy.people;
    statusSafe.textContent = copy.safe;
    statusDecisions.textContent = copy.decisions;

    if (stage === 4) updateRepairState();
    if (stage === 5) {
      briefPrivateOwner.textContent = managerOwner || "Manager choice";
      relayPrivateOwner.textContent = managerOwner || "manager choice";
    }

    if (scroll) document.querySelector(".journey").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function setMethod(nextMethod) {
    method = nextMethod;
    methodButtons.forEach(button => button.setAttribute("aria-checked", String(button.dataset.method === method)));
    intakePanels.forEach(panel => { panel.hidden = panel.dataset.intakePanel !== method; });
  }

  methodButtons.forEach(button => button.addEventListener("click", () => setMethod(button.dataset.method)));

  document.getElementById("scan-file").addEventListener("change", event => {
    const file = event.target.files?.[0];
    document.getElementById("scan-file-status").textContent = file
      ? `${file.name} selected locally. It will not be uploaded or inspected in this demo.`
      : "The public demo does not upload or inspect your file.";
  });

  document.getElementById("voice-button").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById("voice-status");
    const textarea = document.getElementById("briefing-text");

    if (!SpeechRecognition) {
      status.textContent = "Speech recognition is not supported here. The editable sample briefing remains available.";
      showToast("Voice capture is unavailable in this browser.");
      return;
    }

    if (recognition) {
      recognition.stop();
      recognition = null;
      status.textContent = "Listening stopped. No audio was stored.";
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = "";
    recognition.onstart = () => { status.textContent = "Listening… no audio is stored."; };
    recognition.onresult = event => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (finalText.trim()) textarea.value = finalText.trim();
      status.textContent = interim ? `Listening: ${interim}` : "Transcript added. Review it before continuing.";
    };
    recognition.onerror = () => { status.textContent = "Microphone unavailable. Use the editable briefing instead."; recognition = null; };
    recognition.onend = () => { recognition = null; if (!finalText.trim()) status.textContent = "Listening ended. The sample briefing remains editable."; };
    recognition.start();
  });

  document.querySelectorAll('input[name="private-dining-owner"]').forEach(input => {
    input.addEventListener("change", () => {
      managerOwner = selectedOwner();
      updateRepairState();
    });
  });

  document.querySelectorAll("[data-output-tab]").forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.outputTab;
      document.querySelectorAll("[data-output-tab]").forEach(tab => tab.setAttribute("aria-selected", String(tab === button)));
      document.querySelectorAll("[data-output-panel]").forEach(panel => { panel.hidden = panel.dataset.outputPanel !== selected; });
    });
  });

  document.getElementById("copy-relay").addEventListener("click", async () => {
    const text = [...document.querySelectorAll("#relay-output article")]
      .map(article => article.innerText.trim())
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Sample Relay messages copied.");
    } catch {
      showToast("Copy is unavailable in this browser.");
    }
  });

  backButton.addEventListener("click", () => {
    if (stage <= 1) return;
    stage -= 1;
    renderStage();
  });

  primaryButton.addEventListener("click", () => {
    if (stage === 1) {
      stage = 2;
      renderStage();
      showToast(`Sample shift built from the ${method === "venue" ? "saved venue setup" : `${method} route`}.`);
      return;
    }
    if (stage === 2) {
      stage = 3;
      renderStage();
      showToast("Readiness Core completed deterministic verification.");
      return;
    }
    if (stage === 3) {
      stage = 4;
      renderStage();
      showToast("Two safe fixes are ready for manager review.");
      return;
    }
    if (stage === 4) {
      if (!safeFixesApplied) {
        safeFixesApplied = true;
        updateRepairState();
        showToast("Two safe fixes applied. One manager decision remains.");
        return;
      }
      managerOwner = selectedOwner();
      if (!managerOwner) return;
      stage = 5;
      renderStage();
      showToast("Pulse Brief and Pulse Relay generated from the reviewed plan.");
      return;
    }
    window.location.href = earlyAccessUrl;
  });

  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      showToast("Printing is locked in the public demo.");
    }
  });
  window.addEventListener("beforeprint", () => showToast("Printing is locked in the public demo."));

  setMethod(method);
  renderStage({ scroll: false });
})();
