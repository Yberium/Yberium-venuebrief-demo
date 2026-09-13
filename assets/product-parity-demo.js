(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.YberiumFixedSampleDemo = api;
  if (typeof document !== 'undefined') api.mount(document);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VALID_OWNERS = Object.freeze(['Mara Quinn', 'Eli Mercer']);
  const CANONICAL_OWNER = 'Mara Quinn';

  function initialState() {
    return Object.freeze({ selectedOwner: CANONICAL_OWNER, confirmed: false, status: 'Awaiting manager confirmation' });
  }

  function selectOwner(state, owner) {
    if (!VALID_OWNERS.includes(owner)) throw new Error('INVALID_SAMPLE_OWNER');
    return Object.freeze({ selectedOwner: owner, confirmed: false, status: 'Awaiting manager confirmation' });
  }

  function confirmDecision(state) {
    if (!VALID_OWNERS.includes(state?.selectedOwner)) throw new Error('MANAGER_SELECTION_REQUIRED');
    return Object.freeze({ selectedOwner: state.selectedOwner, confirmed: true, status: 'Sample review complete' });
  }

  function mount(doc) {
    const radios = [...doc.querySelectorAll('input[name="owner"]')];
    const confirmButton = doc.getElementById('confirm-decision');
    const pendingState = doc.getElementById('pending-state');
    const completionPending = doc.getElementById('completion-pending');
    const completionState = doc.getElementById('completion-state');
    const hubPending = doc.getElementById('hub-pending');
    const hubState = doc.getElementById('hub-state');
    const completeOwner = doc.getElementById('complete-owner');
    const completeOwnerCopy = doc.getElementById('complete-owner-copy');
    const hubOwner = doc.getElementById('hub-owner');
    const postDemo = doc.getElementById('post-demo');
    if (!confirmButton || !pendingState || !completionState || !hubState) return;

    let state = initialState();

    function render() {
      radios.forEach(input => { input.checked = input.value === state.selectedOwner; });
      pendingState.querySelector('strong').textContent = state.confirmed ? 'Manager decision confirmed' : 'Awaiting manager confirmation';
      pendingState.querySelector('span').textContent = state.confirmed ? 'Explicit confirmation recorded in this fixed sample only' : 'Selection only · not approval · not execution';
      confirmButton.disabled = state.confirmed;
      confirmButton.textContent = state.confirmed ? 'Manager decision confirmed' : 'Confirm manager decision';
      completionPending.hidden = state.confirmed;
      completionState.hidden = !state.confirmed;
      hubPending.hidden = state.confirmed;
      hubState.hidden = !state.confirmed;
      if (postDemo) postDemo.hidden = !state.confirmed;
      if (state.confirmed) {
        completeOwner.textContent = state.selectedOwner;
        completeOwnerCopy.textContent = state.selectedOwner.split(' ')[0];
        hubOwner.textContent = state.selectedOwner;
      }
    }

    radios.forEach(input => input.addEventListener('change', () => {
      state = selectOwner(state, input.value);
      render();
    }));

    confirmButton.addEventListener('click', () => {
      state = confirmDecision(state);
      render();
      completionState.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    });

    render();
  }

  return Object.freeze({ VALID_OWNERS, CANONICAL_OWNER, initialState, selectOwner, confirmDecision, mount });
});
