(() => {
  "use strict";

  const earlyAccessUrl = "https://yberium.github.io/venuebrief-landing/early-access.html";
  const stages = [...document.querySelectorAll("[data-stage]")];
  const journey = [...document.querySelectorAll("[data-journey]")];
  const methodButtons = [...document.querySelectorAll("[data-method]")];
  const intakePanels = [...document.querySelectorAll("[data-intake-panel]")];
  const outputTabs = [...document.querySelectorAll("[data-output-tab]")];
  const outputPanels = [...document.querySelectorAll("[data-output-panel]")];
  const backButton = document.getElementById("back-button");
  const resetButton = document.getElementById("reset-button");
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
  const mobileProgress = document.getElementById("mobile-progress");
  const voiceButton = document.getElementById("voice-button");
  const voiceStatus = document.getElementById("voice-status");
  const toast = document.getElementById("toast");

  let stage = 1;
  let method = "voice";
  let safeFixesApplied = false;
  let managerOwner = "";
  let toastTimer;
  let recognition;

  const stageCopy = {
    1: { title: "Add today’s rota", detail: "Choose scan, voice, text or venue setup.", button: "Build sample shift", readiness: "Not started", label: "Choose an input method", people: "—", safe: "—", decisions: "—", progress: "Add rota" },
    2: { title: "Review the AI proposal", detail: "Nothing is applied until the manager continues.", button: "Verify with Readiness Core", readiness: "Proposal", label: "Manager review", people: "5", safe: "—", decisions: "—", progress: "AI proposal" },
    3: { title: "Verify deterministic issues", detail: "Two safe fixes and one manager decision.", button: "Preview automatic fixes", readiness: "Not ready", label: "3 material issues", people: "5", safe: "2", decisions: "1", progress: "Verify" },
    4: { title: "Repair the shift", detail: "Apply safe fixes, then make the remaining decision.", button: "Apply 2 safe fixes", readiness: "Fixing", label: "Preview changes", people: "5", safe: "2", decisions: "1", progress: "Fix" },
    5: { title: "Use the reviewed outputs", detail: "Pulse Brief and Pulse Relay match the verified plan.", button: "Request early access", readiness: "Ready", label: "Verified plan", people: "5", safe: "0", decisions: "0", progress: "Outputs" }
  };

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function stopRecognition(message = "Listening stopped. Pulse does not store audio.") {
    if (!recognition) return;
    recognition.onend = null;
    recognition.stop();
    recognition = null;
    voiceButton.setAttribute("aria-pressed", "false");
    voiceButton.textContent = "Start listening";
    voiceStatus.textContent = message;
  }

  function selectedOwner() {
    return document.querySelector('input[name="private-dining-owner"]:checked')?.value || "";
  }

  function clearManagerDecision() {
    managerOwner = "";
    document.querySelectorAll('input[name="private-dining-owner"]').forEach(input => { input.checked = false; });
    briefPrivateOwner.textContent = "Manager choice";
    relayPrivateOwner.textContent = "manager choice";
  }

  function selectOutputTab(tabName, { focus = false } = {}) {
    outputTabs.forEach(tab => {
      const active = tab.dataset.outputTab === tabName;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    outputPanels.forEach(panel => { panel.hidden = panel.dataset.outputPanel !== tabName; });
  }

  function invalidateAfter(targetStage) {
    stopRecognition();
    if (targetStage < 5) selectOutputTab("brief");
    if (targetStage < 4) {
      safeFixesApplied = false;
      clearManagerDecision();
    }
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
      repairLead.textContent = "Pulse resolved only the changes that passed the deterministic safety rules.";
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

  function renderStage({ scroll = true, focus = true } = {}) {
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
    mobileProgress.textContent = `${stage} of 5 · ${copy.progress}`;

    if (stage === 4) updateRepairState();
    if (stage === 5) {
      briefPrivateOwner.textContent = managerOwner || "Manager choice";
      relayPrivateOwner.textContent = managerOwner || "manager choice";
    }

    const activeStage = stages.find(node => !node.hidden);
    if (scroll) document.querySelector(".journey").scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (focus) requestAnimationFrame(() => activeStage?.querySelector("h2")?.focus({ preventScroll: true }));
  }

  function setMethod(nextMethod, { focus = false } = {}) {
    stopRecognition();
    method = nextMethod;
    methodButtons.forEach(button => {
      const selected = button.dataset.method === method;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    intakePanels.forEach(panel => { panel.hidden = panel.dataset.intakePanel !== method; });
    invalidateAfter(1);
  }

  methodButtons.forEach((button, index) => {
    button.addEventListener("click", () => setMethod(button.dataset.method));
    button.addEventListener("keydown", event => {
      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % methodButtons.length;
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + methodButtons.length) % methodButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = methodButtons.length - 1;
      setMethod(methodButtons[nextIndex].dataset.method, { focus: true });
    });
  });

  document.getElementById("scan-file").addEventListener("change", event => {
    const file = event.target.files?.[0];
    document.getElementById("scan-file-status").textContent = file
      ? `${file.name} selected locally. It is not uploaded or interpreted in this demo.`
      : "No file is uploaded or inspected in this public demo.";
  });

  voiceButton.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const textarea = document.getElementById("briefing-text");

    if (!SpeechRecognition) {
      voiceStatus.textContent = "Speech recognition is unavailable here. Use the editable sample briefing instead.";
      showToast("Voice capture is unavailable in this browser.");
      return;
    }
    if (recognition) {
      stopRecognition();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = "";
    recognition.onstart = () => {
      voiceButton.setAttribute("aria-pressed", "true");
      voiceButton.textContent = "Stop listening";
      voiceStatus.textContent = "Listening… speech recognition is provided by your browser.";
    };
    recognition.onresult = event => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (finalText.trim()) textarea.value = finalText.trim();
      voiceStatus.textContent = interim ? `Listening: ${interim}` : "Transcript added. The demo will still use its fixed sample shift.";
    };
    recognition.onerror = () => {
      recognition = null;
      voiceButton.setAttribute("aria-pressed", "false");
      voiceButton.textContent = "Start listening";
      voiceStatus.textContent = "Microphone unavailable. Use the editable sample briefing instead.";
    };
    recognition.onend = () => {
      recognition = null;
      voiceButton.setAttribute("aria-pressed", "false");
      voiceButton.textContent = "Start listening";
      if (!finalText.trim()) voiceStatus.textContent = "Listening ended. The sample briefing remains editable.";
    };
    recognition.start();
  });

  document.querySelectorAll('input[name="private-dining-owner"]').forEach(input => {
    input.addEventListener("change", () => {
      managerOwner = selectedOwner();
      updateRepairState();
    });
  });

  outputTabs.forEach((button, index) => {
    button.addEventListener("click", () => selectOutputTab(button.dataset.outputTab));
    button.addEventListener("keydown", event => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % outputTabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + outputTabs.length) % outputTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = outputTabs.length - 1;
      selectOutputTab(outputTabs[nextIndex].dataset.outputTab, { focus: true });
    });
  });

  function relayText() {
    return [...document.querySelectorAll("#relay-output article")]
      .map(article => `${article.querySelector("header strong")?.textContent}\n${article.querySelector("p")?.innerText.trim()}`)
      .join("\n\n");
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      showToast("Copy is unavailable in this browser.");
    }
  }

  document.getElementById("copy-relay").addEventListener("click", () => copyText(relayText(), "All sample Relay messages copied."));
  document.querySelectorAll(".message-copy").forEach(button => {
    button.addEventListener("click", () => {
      const article = button.closest("article");
      const title = article.querySelector("header strong")?.textContent || "Relay message";
      const text = `${title}\n${article.querySelector("p")?.innerText.trim()}`;
      copyText(text, `${title} copied.`);
    });
  });

  const shareButton = document.getElementById("share-relay");
  if (navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({ title: "Yberium Pulse Relay", text: relayText() });
      } catch (error) {
        if (error?.name !== "AbortError") showToast("Sharing is unavailable right now.");
      }
    });
  }

  backButton.addEventListener("click", () => {
    if (stage <= 1) return;
    const targetStage = stage - 1;
    invalidateAfter(targetStage);
    stage = targetStage;
    renderStage();
  });

  resetButton.addEventListener("click", () => {
    stopRecognition();
    stage = 1;
    safeFixesApplied = false;
    clearManagerDecision();
    selectOutputTab("brief");
    document.getElementById("scan-file").value = "";
    document.getElementById("scan-file-status").textContent = "No file is uploaded or inspected in this public demo.";
    setMethod("voice");
    renderStage({ scroll: true, focus: true });
    showToast("Demo reset. Start a new sample shift.");
  });

  primaryButton.addEventListener("click", () => {
    stopRecognition();
    if (stage === 1) {
      stage = 2;
      renderStage();
      showToast(`Fixed sample shift opened from the ${method === "venue" ? "venue setup" : `${method} route`}.`);
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
        document.querySelector('input[name="private-dining-owner"]')?.focus();
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

  const displayMode = window.matchMedia("(display-mode: standalone)");
  function updateInstallState() {
    document.getElementById("install-state").textContent = displayMode.matches || window.navigator.standalone ? "Installed demo" : "Interactive demo";
  }
  displayMode.addEventListener?.("change", updateInstallState);
  updateInstallState();

  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      showToast("Printing is locked in the public demo.");
    }
  });
  window.addEventListener("beforeprint", () => showToast("Printing is locked in the public demo."));

  setMethod(method);
  selectOutputTab("brief");
  renderStage({ scroll: false, focus: false });
})();
