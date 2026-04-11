(() => {
  const STORAGE_KEY = 'english-battle-royale-v3';
  const SOUND_STORAGE_KEY = 'english-battle-royale-sound-enabled';
  const DEFAULT_NAMES = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];
  const MAX_HP = 100;
  const MAIN_TIMER = 15;
  const STEAL_TIMER = 5;
  const MAIN_REWARD_MONEY = 50;
  const MAIN_REWARD_AMMO = 1;
  const MAIN_REWARD_SCORE = 10;
  const STEAL_REWARD_MONEY = 50;
  const STEAL_REWARD_SCORE = 8;
  const HEAL_REWARD = 15;
  const TOTAL_TILES = 28;
  const EVENT_TILE_COUNT = 4;
  const QUESTION_TARGET = 24;
  const PHASE_TWO_TRIGGER = 14;

  const TEAM_META = [
    { icon: '☀️', theme: 'solar' },
    { icon: '🌊', theme: 'ocean' },
    { icon: '🌿', theme: 'forest' },
    { icon: '⚡', theme: 'storm' }
  ];

  const WEAPONS = [
    { key: 'usp', name: 'USP Pistol', damage: 12, price: 0, desc: 'Default sidearm. Clean and reliable.', pierceShield: false },
    { key: 'mp40', name: 'MP-40', damage: 18, price: 100, desc: 'Fast upgrade for stronger shots.', pierceShield: false },
    { key: 'ak47', name: 'AK-47', damage: 28, price: 200, desc: 'Heavy mid-game damage.', pierceShield: false },
    { key: 'awm', name: 'AWM', damage: 45, price: 300, desc: 'High-damage sniper shot that pierces shields.', pierceShield: true }
  ];

  const ITEM_META = {
    medkit: { icon: '🧰', name: 'Medkit', desc: 'Heal 35 HP instantly.', instant: true },
    shield: { icon: '🛡', name: 'Shield', desc: 'Block the next incoming hit.', instant: true },
    flashbang: { icon: '💥', name: 'Flashbang', desc: 'Skip one enemy team on its next turn.', instant: false },
    reflect: { icon: '↩️', name: 'Reflect', desc: 'Reflect 50% of the next damaging hit.', instant: true },
    berserk: { icon: '😡', name: 'Berserk', desc: 'Next shot is free and gains +10 damage.', instant: true },
    c4: { icon: '💣', name: 'C4', desc: 'Plant a scaling bomb on an enemy team.', instant: false },
    thief: { icon: '🦹', name: 'Thief Card', desc: 'Steal half the money and 1 ammo.', instant: false }
  };

  const INVENTORY_ORDER = ['medkit', 'shield', 'flashbang', 'reflect', 'berserk', 'c4', 'thief'];

  const SHOP_ITEMS = [
    { key: 'ammo', name: '+1 Ammo', icon: '🔸', price: 30, type: 'instant', desc: 'Immediate ammo refill.' },
    { key: 'medkit', name: 'Medkit', icon: '🧰', price: 70, type: 'inventory', desc: 'Store a healing kit.' },
    { key: 'shield', name: 'Shield', icon: '🛡', price: 80, type: 'inventory', desc: 'Block one future hit.' },
    { key: 'flashbang', name: 'Flashbang', icon: '💥', price: 100, type: 'inventory', desc: 'Skip one enemy team.' },
    { key: 'reflect', name: 'Reflect', icon: '↩️', price: 110, type: 'inventory', desc: 'Reflect half the next damage.' },
    { key: 'berserk', name: 'Berserk', icon: '😡', price: 120, type: 'inventory', desc: 'Next attack is free and stronger.' },
    { key: 'c4', name: 'C4', icon: '💣', price: 130, type: 'inventory', desc: 'Trap an enemy team.' },
    { key: 'thief', name: 'Thief Card', icon: '🦹', price: 140, type: 'inventory', desc: 'Steal cash and ammo.' }
  ];

  const EVENT_TEMPLATES = [
    {
      key: 'supply-drop',
      title: 'Supply Drop',
      apply(team) {
        team.money += 50;
        team.ammo += 1;
        return `${team.name} opened a Supply Drop and gained +$50 and +1 ammo.`;
      }
    },
    {
      key: 'field-medic',
      title: 'Field Medic',
      apply(team) {
        const before = team.hp;
        team.hp = clamp(team.hp + 25, 0, MAX_HP);
        return `${team.name} met a Field Medic and recovered ${team.hp - before} HP.`;
      }
    },
    {
      key: 'tactical-kit',
      title: 'Tactical Kit',
      apply(team) {
        team.inventory.shield += 1;
        team.inventory.flashbang += 1;
        return `${team.name} received +1 Shield and +1 Flashbang.`;
      }
    },
    {
      key: 'upgrade-chip',
      title: 'Upgrade Chip',
      apply(team) {
        if (team.weapon < WEAPONS.length - 1) {
          team.weapon += 1;
          return `${team.name} upgraded for free to ${WEAPONS[team.weapon].name}.`;
        }
        team.money += 100;
        return `${team.name} was already maxed out and converted the Upgrade Chip into +$100.`;
      }
    }
  ];

  const CRATE_REWARDS = [
    {
      key: 'crate-medkit',
      title: 'Medical Burst',
      desc: 'Heal 35 HP instantly.',
      apply(team) {
        const before = team.hp;
        team.hp = clamp(team.hp + 35, 0, MAX_HP);
        return `${team.name} recovered ${team.hp - before} HP from the support crate.`;
      }
    },
    {
      key: 'crate-ammo',
      title: 'Ammo Rain',
      desc: '+2 ammo and +$60.',
      apply(team) {
        team.ammo += 2;
        team.money += 60;
        return `${team.name} gained +2 ammo and +$60 from the support crate.`;
      }
    },
    {
      key: 'crate-upgrade',
      title: 'Weapon Coupon',
      desc: 'Upgrade one weapon tier for free.',
      apply(team) {
        if (team.weapon < WEAPONS.length - 1) {
          team.weapon += 1;
          return `${team.name} upgraded to ${WEAPONS[team.weapon].name} for free.`;
        }
        team.money += 100;
        return `${team.name} was already maxed and converted the coupon into +$100.`;
      }
    },
    {
      key: 'crate-c4',
      title: 'Sabotage Pack',
      desc: 'Gain 1 C4 and 1 Thief Card.',
      apply(team) {
        team.inventory.c4 += 1;
        team.inventory.thief += 1;
        return `${team.name} received 1 C4 and 1 Thief Card.`;
      }
    },
    {
      key: 'crate-armor',
      title: 'Armor Bundle',
      desc: 'Gain 1 Shield and 1 Reflect.',
      apply(team) {
        team.inventory.shield += 1;
        team.inventory.reflect += 1;
        return `${team.name} received 1 Shield and 1 Reflect.`;
      }
    },
    {
      key: 'crate-berserk',
      title: 'Rage Fuel',
      desc: 'Gain 1 Berserk and +$50.',
      apply(team) {
        team.inventory.berserk += 1;
        team.money += 50;
        return `${team.name} received 1 Berserk and +$50.`;
      }
    }
  ];

  const EXTRA_QUESTIONS = [
    {
      category: 'Travel Idioms',
      prompt: 'After waiting in line for an hour at the check-in counter, finally getting my boarding pass felt like ________.',
      options: {
        A: 'no sweat',
        B: 'a safe bet',
        C: 'crossing that bridge',
        D: 'a huge relief'
      },
      correct: 'D',
      explanation: '“A huge relief” fits the idea of stress ending after a long wait.'
    }
  ];

  const dom = {
    phaseLabel: document.getElementById('phaseLabel'),
    currentTurnLabel: document.getElementById('currentTurnLabel'),
    scoreboardGrid: document.getElementById('scoreboardGrid'),
    allianceBanner: document.getElementById('allianceBanner'),
    leftColumn: document.getElementById('leftColumn'),
    rightColumn: document.getElementById('rightColumn'),
    boardGrid: document.getElementById('boardGrid'),
    miniFeed: document.getElementById('miniFeed'),
    stageOverlay: document.getElementById('stageOverlay'),
    setupScreen: document.getElementById('setupScreen'),
    rulesScreen: document.getElementById('rulesScreen'),
    teamInputs: [0, 1, 2, 3].map((index) => document.getElementById(`teamName${index}`)),
    toastHost: document.getElementById('toastHost'),
    soundToggleBtn: document.getElementById('soundToggleBtn')
  };

  let timerRef = null;
  let audioCtx = null;
  let soundEnabled = loadSoundPreference();
  let lastStageSignature = '';
  let state = createState(DEFAULT_NAMES, 'setup');

  init();

  function init() {
    bindEvents();
    const restored = restoreState();
    if (!restored) {
      state = createState(DEFAULT_NAMES, 'setup');
    } else {
      toast('Autosave restored', 'The latest match state was loaded.', 'info');
    }
    syncInputs();
    renderAll();
  }

  function bindEvents() {
    document.body.addEventListener('pointerdown', bootstrapAudio, { once: true });
    document.getElementById('newMatchBtn').addEventListener('click', openSetupFlow);
    document.getElementById('openRulesBtn').addEventListener('click', () => {
      if (state.screen === 'setup') {
        state.screen = 'rules';
      } else if (state.screen === 'rules') {
        state.screen = 'game';
      } else {
        state.screen = 'rules';
      }
      clearTimer();
      persistState();
      renderAll();
    });
    document.getElementById('clearSaveBtn').addEventListener('click', clearSave);
    document.getElementById('startFromSetupBtn').addEventListener('click', () => {
      applyNamesFromInputs();
      state.screen = 'rules';
      persistState();
      renderAll();
    });
    document.getElementById('backToSetupBtn').addEventListener('click', () => {
      state.screen = 'setup';
      persistState();
      renderAll();
    });
    document.getElementById('continueToGameBtn').addEventListener('click', () => {
      startFreshMatch(getNamesFromInputs());
    });
    dom.soundToggleBtn.addEventListener('click', toggleSound);

    document.body.addEventListener('click', handleDelegatedClick);
  }

  function handleDelegatedClick(event) {
    const tileButton = event.target.closest('[data-open-tile]');
    if (tileButton) {
      openTile(Number(tileButton.dataset.openTile));
      return;
    }

    const optionButton = event.target.closest('[data-answer-choice]');
    if (optionButton) {
      submitAnswer(optionButton.dataset.answerChoice);
      return;
    }

    const stealButton = event.target.closest('[data-steal-team]');
    if (stealButton) {
      chooseStealTeam(stealButton.dataset.stealTeam);
      return;
    }

    const stageAction = event.target.closest('[data-stage-action]');
    if (stageAction) {
      handleStageAction(stageAction.dataset.stageAction);
      return;
    }

    const crateButton = event.target.closest('[data-crate-key]');
    if (crateButton) {
      chooseCrate(crateButton.dataset.crateKey);
      return;
    }

    const inventoryButton = event.target.closest('[data-use-item]');
    if (inventoryButton) {
      const [teamId, itemKey] = inventoryButton.dataset.useItem.split(':');
      attemptUseItem(teamId, itemKey);
      return;
    }

    const shopButton = event.target.closest('[data-open-shop]');
    if (shopButton) {
      openShop(shopButton.dataset.openShop, false);
      return;
    }

    const buyButton = event.target.closest('[data-buy-item]');
    if (buyButton) {
      const [kind, key] = buyButton.dataset.buyItem.split(':');
      purchaseFromShop(kind, key);
      return;
    }

    const targetButton = event.target.closest('[data-target-team]');
    if (targetButton) {
      resolveTargetSelection(targetButton.dataset.targetTeam);
    }
  }

  function createState(names, screen) {
    const safeNames = normalizeNames(names || DEFAULT_NAMES);
    const questions = buildQuestionPool();
    return {
      version: 4,
      screen,
      teams: createTeams(safeNames),
      questions,
      board: buildBoard(questions),
      currentTurnIndex: 0,
      phase: 1,
      alliances: null,
      active: null,
      timer: { seconds: 0, maxSeconds: 0, label: 'Ready', running: false },
      feed: 'Open a tile to begin the match.',
      flags: { endgame: false }
    };
  }

  function createTeams(names) {
    return names.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      icon: TEAM_META[index].icon,
      theme: TEAM_META[index].theme,
      hp: 100,
      ammo: 1,
      money: 0,
      weapon: 0,
      streak: 0,
      score: 0,
      correctAnswers: 0,
      inventory: {
        medkit: 0,
        shield: 0,
        flashbang: 0,
        reflect: 0,
        berserk: 0,
        c4: 0,
        thief: 0
      },
      statuses: {
        skipTurns: 0,
        shield: 0,
        reflect: 0,
        berserk: 0
      },
      traps: {
        c4: null
      }
    }));
  }

  function buildQuestionPool() {
    const bank = Array.isArray(window.QUESTION_BANK) ? [...window.QUESTION_BANK] : [];
    while (bank.length < QUESTION_TARGET && EXTRA_QUESTIONS.length) {
      const next = EXTRA_QUESTIONS[bank.length % EXTRA_QUESTIONS.length];
      bank.push(next);
    }
    return bank.slice(0, QUESTION_TARGET).map((entry, index) => ({
      id: index + 1,
      category: entry.category,
      prompt: entry.prompt,
      options: { ...entry.options },
      correct: entry.correct,
      explanation: entry.explanation
    }));
  }

  function buildBoard(questions) {
    const eventPositions = pickUniqueIndexes(TOTAL_TILES, EVENT_TILE_COUNT);
    const events = shuffle([...EVENT_TEMPLATES]);
    const tiles = [];
    let questionIndex = 0;
    let eventIndex = 0;

    for (let i = 0; i < TOTAL_TILES; i += 1) {
      const isEvent = eventPositions.includes(i);
      if (isEvent) {
        tiles.push({
          id: i + 1,
          kind: 'event',
          eventKey: events[eventIndex].key,
          used: false
        });
        eventIndex += 1;
      } else {
        tiles.push({
          id: i + 1,
          kind: 'question',
          questionId: questions[questionIndex].id,
          used: false
        });
        questionIndex += 1;
      }
    }

    return tiles;
  }

  function startFreshMatch(names) {
    clearTimer();
    state = createState(names, 'game');
    state.feed = `Current turn: ${getCurrentTeam().name}. Open any hidden tile to start.`;
    persistState();
    renderAll();
    triggerArenaFlash('success');
    playSfx('start');
    toast('Arena ready', 'The match has started with the new team names.', 'success');
  }

  function openSetupFlow() {
    clearTimer();
    state = createState(state.teams.map((team) => team.name), 'setup');
    syncInputs();
    persistState();
    renderAll();
  }

  function applyNamesFromInputs() {
    const names = getNamesFromInputs();
    state.teams.forEach((team, index) => {
      team.name = names[index];
    });
    persistState();
  }

  function getNamesFromInputs() {
    return normalizeNames(dom.teamInputs.map((input, index) => input.value || state.teams[index]?.name || DEFAULT_NAMES[index]));
  }

  function normalizeNames(list) {
    return list.map((name, index) => String(name || DEFAULT_NAMES[index]).trim() || DEFAULT_NAMES[index]);
  }

  function syncInputs() {
    dom.teamInputs.forEach((input, index) => {
      input.value = state.teams[index]?.name || DEFAULT_NAMES[index];
    });
  }

  function openTile(tileId) {
    if (state.screen !== 'game' || state.active || state.flags.endgame) return;
    const tile = getTileById(tileId);
    if (!tile || tile.used) return;
    ensureCurrentTurnValid();
    const currentTeam = getCurrentTeam();
    if (!currentTeam) return;

    if (tile.kind === 'event') {
      resolveEventTile(tile, currentTeam);
      return;
    }

    state.active = {
      type: 'question',
      tileId,
      questionId: tile.questionId,
      turnOwnerId: currentTeam.id,
      responderId: currentTeam.id,
      mode: 'main',
      stealPool: getStealCandidates(currentTeam.id),
      answerShown: false,
      lastPick: null
    };
    startTimer(MAIN_TIMER, 'Main Turn');
    state.feed = `${currentTeam.name} is answering Tile ${tile.id}.`;
    persistState();
    renderAll();
    triggerArenaFlash('info');
    playSfx('tile-open');
  }

  function resolveEventTile(tile, team) {
    const template = EVENT_TEMPLATES.find((entry) => entry.key === tile.eventKey);
    if (!template) return;
    tile.used = true;
    clearTimer();
    const message = template.apply(team);
    state.active = {
      type: 'event',
      teamId: team.id,
      title: template.title,
      message
    };
    state.feed = message;
    persistState();
    renderAll();
    triggerArenaFlash('info');
    playSfx('event');
    toast(template.title, message, 'info');
  }

  function submitAnswer(choice) {
    if (!state.active || state.active.type !== 'question') return;
    if (!['main', 'steal'].includes(state.active.mode)) return;

    const question = getQuestionById(state.active.questionId);
    const responder = getTeamById(state.active.responderId);
    if (!question || !responder) return;

    state.active.lastPick = { choice, correct: choice === question.correct };

    if (choice === question.correct) {
      resolveCorrectAnswer(responder);
    } else if (state.active.mode === 'main') {
      handleMainFailure(false);
    } else {
      handleStealFailure(responder.id, false);
    }
  }

  function handleMainFailure(fromTimer) {
    const active = state.active;
    if (!active || active.type !== 'question') return;
    const responder = getTeamById(active.turnOwnerId);
    if (!responder) return;

    const notes = registerAnswerResult(responder.id, false);
    const stealCandidates = getStealCandidates(responder.id);
    if (!stealCandidates.length) {
      finishQuestionWithoutWinner(fromTimer ? `${responder.name} ran out of time.` : `${responder.name} answered incorrectly.`);
      return;
    }

    clearTimer();
    state.active.mode = 'steal-pick';
    state.active.responderId = null;
    state.timer = { seconds: 0, maxSeconds: 0, label: 'Pick a stealing team', running: false };
    state.feed = fromTimer
      ? `${responder.name} ran out of time. Pick one of the other three teams for the steal turn.`
      : `${responder.name} missed the question. Pick one of the other three teams for the steal turn.`;
    persistState();
    renderAll();
    triggerArenaFlash('warn');
    playSfx(fromTimer ? 'timeout' : 'wrong');
    if (notes.length) {
      toast('Penalty triggered', notes.join(' '), 'warn');
    } else {
      toast('Steal round', 'Choose one of the other teams for the 5-second steal turn.', 'warn');
    }
  }

  function chooseStealTeam(teamId) {
    if (!state.active || state.active.type !== 'question' || state.active.mode !== 'steal-pick') return;
    if (!state.active.stealPool.includes(teamId)) return;
    const team = getTeamById(teamId);
    if (!team || team.hp <= 0 || team.statuses.skipTurns > 0) return;

    state.active.mode = 'steal';
    state.active.responderId = teamId;
    state.active.answerShown = false;
    state.active.lastPick = null;
    startTimer(STEAL_TIMER, 'Steal Turn');
    state.feed = `${team.name} is taking the steal turn on Tile ${state.active.tileId}.`;
    persistState();
    renderAll();
    triggerArenaFlash('info');
    playSfx('steal-start');
  }

  function handleStealFailure(teamId, fromTimer) {
    const active = state.active;
    if (!active || active.type !== 'question') return;
    const responder = getTeamById(teamId);
    if (!responder) return;

    const notes = registerAnswerResult(teamId, false);
    active.stealPool = active.stealPool.filter((id) => id !== teamId);

    if (!active.stealPool.length) {
      finishQuestionWithoutWinner(fromTimer ? `${responder.name} ran out of time on the steal turn.` : `${responder.name} missed the steal turn.`);
      return;
    }

    clearTimer();
    active.mode = 'steal-pick';
    active.responderId = null;
    active.lastPick = null;
    state.timer = { seconds: 0, maxSeconds: 0, label: 'Pick a stealing team', running: false };
    state.feed = `${responder.name} did not score. Choose another team for the next steal attempt.`;
    persistState();
    renderAll();
    triggerArenaFlash('warn');
    playSfx(fromTimer ? 'timeout' : 'wrong');
    if (notes.length) {
      toast('Penalty triggered', notes.join(' '), 'warn');
    } else {
      toast('Next steal attempt', 'Choose another team for the final steal attempt.', 'warn');
    }
  }

  function resolveCorrectAnswer(team) {
    const active = state.active;
    if (!active || active.type !== 'question') return;
    const question = getQuestionById(active.questionId);
    if (!question) return;

    const isSteal = active.mode === 'steal';
    const rewardMoney = isSteal ? STEAL_REWARD_MONEY : MAIN_REWARD_MONEY;
    const rewardAmmo = isSteal ? 0 : MAIN_REWARD_AMMO;
    const rewardScore = isSteal ? STEAL_REWARD_SCORE : MAIN_REWARD_SCORE;

    const notes = registerAnswerResult(team.id, true);
    team.money += rewardMoney;
    team.ammo += rewardAmmo;
    team.score += rewardScore;
    team.correctAnswers += 1;

    const tile = getTileById(active.tileId);
    if (tile) tile.used = true;

    clearTimer();

    let crateChoices = null;
    if (team.streak > 0 && team.streak % 3 === 0) {
      crateChoices = sampleMany(CRATE_REWARDS, 3).map((entry) => entry.key);
      notes.push(`${team.name} hit a ${team.streak}-answer streak and unlocked a support crate.`);
      toast('Support crate unlocked', `${team.name} unlocked a streak crate.`, 'success');
    }

    state.active = {
      type: 'reward',
      teamId: team.id,
      moneyAward: rewardMoney,
      ammoAward: rewardAmmo,
      scoreAward: rewardScore,
      crateChoices,
      crateChosen: false,
      notes
    };
    state.timer = { seconds: 0, maxSeconds: 0, label: 'Reward Menu', running: false };
    state.feed = `${team.name} answered correctly and can now choose a reward action.`;
    persistState();
    renderAll();
    triggerArenaFlash('success');
    playSfx('correct');
    toast('Correct answer', `${team.name} earned the reward menu.`, 'success');
  }

  function finishQuestionWithoutWinner(reason) {
    const active = state.active;
    if (!active || active.type !== 'question') return;
    const tile = getTileById(active.tileId);
    if (tile) tile.used = true;
    clearTimer();
    state.active = null;
    state.timer = { seconds: 0, maxSeconds: 0, label: 'Ready', running: false };
    state.feed = `Tile ${tile?.id || ''} ended with no winner. ${reason}`.trim();
    triggerArenaFlash('info');
    playSfx('timeout');
    toast('No winner', reason, 'info');
    finalizeTurn();
  }

  function handleStageAction(action) {
    if (action === 'toggle-answer') {
      if (state.active?.type === 'question') {
        state.active.answerShown = !state.active.answerShown;
        persistState();
        renderStage();
      }
      return;
    }

    if (action === 'pause-timer') {
      pauseTimer();
      return;
    }

    if (action === 'restart-timer') {
      restartTimer();
      return;
    }

    if (action === 'skip-tile') {
      finishQuestionWithoutWinner('The host ended this tile without a winner.');
      return;
    }

    if (action === 'close-event') {
      state.active = null;
      finalizeTurn();
      return;
    }

    if (action === 'reward-attack') {
      beginRewardAttack();
      return;
    }

    if (action === 'reward-ammo') {
      resolveRewardAmmo();
      return;
    }

    if (action === 'reward-heal') {
      resolveRewardHeal();
      return;
    }

    if (action === 'reward-shop') {
      if (state.active?.type === 'reward') {
        openShop(state.active.teamId, true);
      }
      return;
    }

    if (action === 'close-shop') {
      closeShop();
      return;
    }

    if (action === 'cancel-target') {
      cancelTargeting();
      return;
    }

    if (action === 'restart-match') {
      openSetupFlow();
      return;
    }
  }

  function beginRewardAttack() {
    if (state.active?.type !== 'reward') return;
    const team = getTeamById(state.active.teamId);
    if (!team) return;
    if (state.active.crateChoices && !state.active.crateChosen) {
      toast('Claim the crate first', 'Pick one of the crate rewards before attacking.', 'warn');
      return;
    }
    if (team.ammo <= 0 && team.statuses.berserk <= 0) {
      toast('No ammo ready', `${team.name} does not have ammo for an attack.`, 'warn');
      return;
    }
    const targets = getEnemyTargets(team.id);
    if (!targets.length) {
      toast('No valid target', 'There is no enemy team available to attack.', 'warn');
      return;
    }
    state.active = {
      type: 'target',
      sourceTeamId: team.id,
      action: 'attack',
      fromReward: true,
      returnTo: JSON.parse(JSON.stringify(state.active)),
      title: `Choose an attack target for ${team.name}`,
      description: `${WEAPONS[team.weapon].name} deals ${WEAPONS[team.weapon].damage} damage${WEAPONS[team.weapon].pierceShield ? ' and pierces shields' : ''}.`,
      targetIds: targets.map((entry) => entry.id)
    };
    persistState();
    renderAll();
  }

  function resolveRewardAmmo() {
    if (state.active?.type !== 'reward') return;
    if (state.active.crateChoices && !state.active.crateChosen) {
      toast('Claim the crate first', 'Pick one of the crate rewards before ending the turn.', 'warn');
      return;
    }
    const team = getTeamById(state.active.teamId);
    if (!team) return;
    team.ammo += 1;
    state.feed = `${team.name} chose +1 extra ammo.`;
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Ammo stacked', `${team.name} now has ${team.ammo} ammo.`, 'success');
    state.active = null;
    finalizeTurn();
  }

  function resolveRewardHeal() {
    if (state.active?.type !== 'reward') return;
    if (state.active.crateChoices && !state.active.crateChosen) {
      toast('Claim the crate first', 'Pick one of the crate rewards before ending the turn.', 'warn');
      return;
    }
    const team = getTeamById(state.active.teamId);
    if (!team) return;
    const before = team.hp;
    team.hp = clamp(team.hp + HEAL_REWARD, 0, MAX_HP);
    state.feed = `${team.name} healed ${team.hp - before} HP.`;
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Heal used', `${team.name} recovered ${team.hp - before} HP.`, 'success');
    state.active = null;
    finalizeTurn();
  }

  function chooseCrate(crateKey) {
    if (state.active?.type !== 'reward' || !state.active.crateChoices || state.active.crateChosen) return;
    if (!state.active.crateChoices.includes(crateKey)) return;
    const team = getTeamById(state.active.teamId);
    const reward = CRATE_REWARDS.find((entry) => entry.key === crateKey);
    if (!team || !reward) return;

    const result = reward.apply(team);
    state.active.crateChosen = true;
    state.active.notes.push(result);
    state.feed = result;
    persistState();
    renderAll();
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Crate claimed', result, 'success');
  }

  function openShop(teamId, fromReward) {
    const team = getTeamById(teamId);
    if (!team || team.hp <= 0) return;
    if (fromReward && state.active?.type === 'reward') {
      if (state.active.crateChoices && !state.active.crateChosen) {
        toast('Claim the crate first', 'Pick a crate reward before opening the shop.', 'warn');
        return;
      }
    }
    state.active = {
      type: 'shop',
      teamId,
      fromReward
    };
    persistState();
    renderAll();
    playSfx('ui');
  }

  function closeShop() {
    if (state.active?.type !== 'shop') return;
    const fromReward = state.active.fromReward;
    const teamId = state.active.teamId;
    state.active = null;
    if (fromReward) {
      state.feed = `${getTeamById(teamId)?.name || 'The team'} finished shopping and ended the turn.`;
      finalizeTurn();
    } else {
      persistState();
      renderAll();
    }
  }

  function purchaseFromShop(kind, key) {
    if (state.active?.type !== 'shop') return;
    const team = getTeamById(state.active.teamId);
    if (!team) return;

    if (kind === 'weapon') {
      const index = Number(key);
      const weapon = WEAPONS[index];
      if (!weapon || index !== team.weapon + 1 || team.money < weapon.price) return;
      team.money -= weapon.price;
      team.weapon = index;
      state.feed = `${team.name} upgraded to ${weapon.name}.`;
      triggerArenaFlash('success');
      playSfx('utility');
      toast('Weapon upgraded', `${team.name} bought ${weapon.name}.`, 'success');
      persistState();
      renderAll();
      return;
    }

    if (kind === 'item') {
      const item = SHOP_ITEMS.find((entry) => entry.key === key);
      if (!item || team.money < item.price) return;
      team.money -= item.price;
      if (item.key === 'ammo') {
        team.ammo += 1;
      } else {
        team.inventory[item.key] += 1;
      }
      state.feed = `${team.name} bought ${item.name}.`;
      triggerArenaFlash('success');
      playSfx('utility');
      toast('Purchase complete', `${team.name} bought ${item.name}.`, 'success');
      persistState();
      renderAll();
    }
  }

  function attemptUseItem(teamId, itemKey) {
    const team = getTeamById(teamId);
    if (!team || team.inventory[itemKey] <= 0) return;
    if (!canInteractWithTeam(teamId)) return;

    if (ITEM_META[itemKey].instant) {
      useInstantItem(team, itemKey);
      persistState();
      renderAll();
      return;
    }

    const targets = getEnemyTargets(team.id);
    if (!targets.length) {
      toast('No valid target', 'There is no enemy team available for this item.', 'warn');
      return;
    }

    state.active = {
      type: 'target',
      sourceTeamId: team.id,
      action: itemKey,
      fromReward: false,
      returnTo: null,
      title: `Choose a target for ${ITEM_META[itemKey].name}`,
      description: ITEM_META[itemKey].desc,
      targetIds: targets.map((entry) => entry.id)
    };
    persistState();
    renderAll();
  }

  function useInstantItem(team, itemKey) {
    if (itemKey === 'medkit') {
      const before = team.hp;
      team.inventory.medkit -= 1;
      team.hp = clamp(team.hp + 35, 0, MAX_HP);
      state.feed = `${team.name} used a Medkit and recovered ${team.hp - before} HP.`;
      triggerArenaFlash('success');
      playSfx('utility');
      toast('Medkit used', `${team.name} recovered ${team.hp - before} HP.`, 'success');
      return;
    }

    if (itemKey === 'shield') {
      team.inventory.shield -= 1;
      team.statuses.shield = 1;
      state.feed = `${team.name} activated a Shield.`;
      playSfx('utility');
      toast('Shield ready', `${team.name} will block the next incoming hit.`, 'info');
      return;
    }

    if (itemKey === 'reflect') {
      team.inventory.reflect -= 1;
      team.statuses.reflect = 1;
      state.feed = `${team.name} activated Reflect.`;
      playSfx('utility');
      toast('Reflect ready', `${team.name} will reflect part of the next damage taken.`, 'info');
      return;
    }

    if (itemKey === 'berserk') {
      team.inventory.berserk -= 1;
      team.statuses.berserk = 1;
      state.feed = `${team.name} activated Berserk.`;
      playSfx('utility');
      toast('Berserk ready', `${team.name}'s next shot is free and stronger.`, 'info');
    }
  }

  function resolveTargetSelection(targetId) {
    if (state.active?.type !== 'target') return;
    const source = getTeamById(state.active.sourceTeamId);
    const target = getTeamById(targetId);
    if (!source || !target) return;

    if (state.active.action === 'attack') {
      const result = applyAttack(source, target);
      if (!result) return;
      state.feed = result.message;
      toast('Attack resolved', result.message, result.kind);
      const pulseClass = result.kind === 'danger' ? 'pulse-danger' : 'pulse-warn';
      triggerArenaFlash(result.kind === 'danger' ? 'danger' : 'warn');
      playSfx(result.kind === 'danger' ? 'attack-hit' : 'attack-block');
      state.active = null;
      finalizeTurn();
      pulseTeamCard(target.id, pulseClass);
      return;
    }

    if (state.active.action === 'flashbang') {
      source.inventory.flashbang -= 1;
      target.statuses.skipTurns += 1;
      state.feed = `${source.name} used Flashbang on ${target.name}. ${target.name} will lose its next turn.`;
      triggerArenaFlash('warn');
      playSfx('utility');
      toast('Flashbang landed', `${target.name} will be skipped on the next turn.`, 'warn');
    }

    if (state.active.action === 'c4') {
      source.inventory.c4 -= 1;
      target.traps.c4 = { ownerId: source.id, progress: 0 };
      state.feed = `${source.name} planted C4 on ${target.name}.`;
      triggerArenaFlash('danger');
      playSfx('trap');
      toast('C4 planted', `${target.name} now carries a bomb penalty.`, 'danger');
    }

    if (state.active.action === 'thief') {
      source.inventory.thief -= 1;
      const stolenMoney = Math.floor(target.money / 2);
      const stolenAmmo = Math.min(1, target.ammo);
      target.money -= stolenMoney;
      target.ammo -= stolenAmmo;
      source.money += stolenMoney;
      source.ammo += stolenAmmo;
      state.feed = `${source.name} stole $${stolenMoney} and ${stolenAmmo} ammo from ${target.name}.`;
      triggerArenaFlash('success');
      playSfx('utility');
      toast('Thief Card used', `${source.name} stole resources from ${target.name}.`, 'success');
    }

    state.active = null;
    persistState();
    renderAll();
    maybeOpenEndgame();
  }

  function cancelTargeting() {
    if (state.active?.type !== 'target') return;
    if (state.active.fromReward && state.active.returnTo) {
      state.active = state.active.returnTo;
    } else {
      state.active = null;
    }
    persistState();
    renderAll();
  }

  function applyAttack(attacker, target) {
    const weapon = WEAPONS[attacker.weapon];
    let damage = weapon.damage;
    const notes = [];

    if (attacker.statuses.berserk > 0) {
      attacker.statuses.berserk = 0;
      damage += 10;
      notes.push('Berserk added +10 damage and the shot was free.');
    } else if (attacker.ammo <= 0) {
      toast('No ammo ready', `${attacker.name} does not have enough ammo to shoot.`, 'warn');
      return null;
    } else {
      attacker.ammo -= 1;
    }

    let actualDamage = damage;
    if (target.statuses.shield > 0) {
      target.statuses.shield = 0;
      if (weapon.pierceShield) {
        notes.push('The shield was pierced by the AWM.');
      } else {
        actualDamage = 0;
        notes.push('The target blocked the hit with a shield.');
      }
    }

    target.hp = clamp(target.hp - actualDamage, 0, MAX_HP);

    if (target.statuses.reflect > 0 && actualDamage > 0) {
      const reflected = Math.max(6, Math.floor(actualDamage * 0.5));
      target.statuses.reflect = 0;
      attacker.hp = clamp(attacker.hp - reflected, 0, MAX_HP);
      notes.push(`${target.name} reflected ${reflected} damage back.`);
    }

    if (target.hp <= 0) notes.push(`${target.name} was eliminated.`);
    if (attacker.hp <= 0) notes.push(`${attacker.name} was eliminated by reflected damage.`);

    return {
      kind: actualDamage > 0 ? 'danger' : 'warn',
      message: `${attacker.name} hit ${target.name} for ${actualDamage} damage. ${notes.join(' ')}`.trim()
    };
  }

  function registerAnswerResult(teamId, correct) {
    const team = getTeamById(teamId);
    if (!team) return [];
    const notes = [];

    if (correct) {
      team.streak += 1;
    } else {
      team.streak = 0;
    }

    if (team.traps.c4) {
      if (correct) {
        team.traps.c4.progress += 1;
        if (team.traps.c4.progress >= 3) {
          team.traps.c4 = null;
          notes.push(`${team.name} disarmed the C4 after 3 correct answers.`);
        } else {
          notes.push(`${team.name} survived the C4 pressure (${team.traps.c4.progress}/3).`);
        }
      } else {
        const scale = [20, 40, 60];
        const damage = scale[Math.min(team.traps.c4.progress, scale.length - 1)];
        team.hp = clamp(team.hp - damage, 0, MAX_HP);
        team.traps.c4 = null;
        notes.push(`${team.name}'s C4 exploded for ${damage} damage.`);
      }
    }

    return notes;
  }

  function finalizeTurn() {
    maybeActivatePhaseTwo();
    if (maybeOpenEndgame()) {
      persistState();
      renderAll();
      return;
    }
    advanceTurn();
    persistState();
    renderAll();
  }

  function advanceTurn() {
    const aliveTeams = getAliveTeams();
    if (!aliveTeams.length) return;

    for (let step = 0; step < state.teams.length; step += 1) {
      state.currentTurnIndex = (state.currentTurnIndex + 1) % state.teams.length;
      const candidate = state.teams[state.currentTurnIndex];
      if (candidate.hp <= 0) continue;
      if (candidate.statuses.skipTurns > 0) {
        candidate.statuses.skipTurns -= 1;
        state.feed = `${candidate.name} lost this turn because of Flashbang.`;
        toast('Turn skipped', `${candidate.name} was skipped this round.`, 'warn');
        continue;
      }
      state.feed = `Current turn: ${candidate.name}. Open any hidden tile to continue.`;
      return;
    }
  }

  function ensureCurrentTurnValid() {
    const team = getCurrentTeam();
    if (team && team.hp > 0 && team.statuses.skipTurns <= 0) return;
    advanceTurn();
  }

  function maybeActivatePhaseTwo() {
    if (state.phase === 2) return;
    const remainingTiles = state.board.filter((tile) => !tile.used).length;
    const aliveTeams = getAliveTeams();
    if (remainingTiles <= 0 || aliveTeams.length <= 2) return;
    const trigger = remainingTiles <= PHASE_TWO_TRIGGER || aliveTeams.some((team) => team.hp <= 50);
    if (!trigger) return;

    const ranked = [...state.teams].sort((a, b) => b.hp - a.hp);
    state.phase = 2;
    state.alliances = [
      { name: 'Alliance A', teamIds: [ranked[0].id, ranked[3].id] },
      { name: 'Alliance B', teamIds: [ranked[1].id, ranked[2].id] }
    ];
    triggerArenaFlash('info');
    playSfx('phase');
    toast('Phase 2 activated', 'The arena has shifted into a 2 vs 2 alliance battle.', 'info');
  }

  function maybeOpenEndgame() {
    if (state.flags.endgame) return true;
    const remainingTiles = state.board.filter((tile) => !tile.used).length;
    const aliveTeams = getAliveTeams();

    if (state.phase === 1) {
      if (remainingTiles > 0 && aliveTeams.length > 1) return false;
      state.flags.endgame = true;
      state.active = { type: 'endgame' };
      state.screen = 'game';
      return true;
    }

    const allianceStats = getAllianceStats();
    const aliveAlliances = allianceStats.filter((alliance) => alliance.alive);
    if (remainingTiles > 0 && aliveAlliances.length > 1) return false;
    state.flags.endgame = true;
    state.active = { type: 'endgame' };
    state.screen = 'game';
    return true;
  }

  function restartTimer() {
    if (state.active?.type !== 'question') return;
    if (state.active.mode === 'main') {
      startTimer(MAIN_TIMER, 'Main Turn');
      return;
    }
    if (state.active.mode === 'steal') {
      startTimer(STEAL_TIMER, 'Steal Turn');
    }
  }

  function startTimer(seconds, label) {
    clearTimer();
    state.timer = { seconds, maxSeconds: seconds, label, running: true };
    persistState();
    renderStage();
    updateQuestionTimerUi();

    timerRef = window.setInterval(() => {
      state.timer.seconds -= 1;
      updateQuestionTimerUi();
      if (state.active?.type === 'question' && ['main', 'steal'].includes(state.active.mode) && state.timer.seconds > 0 && state.timer.seconds <= 5) {
        playSfx('tick');
      }
      if (state.timer.seconds <= 0) {
        clearTimer();
        state.timer.running = false;
        state.timer.seconds = 0;
        updateQuestionTimerUi();
        if (state.active?.type === 'question' && state.active.mode === 'main') {
          handleMainFailure(true);
        } else if (state.active?.type === 'question' && state.active.mode === 'steal' && state.active.responderId) {
          handleStealFailure(state.active.responderId, true);
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    clearTimer();
    if (state.active?.type === 'question') {
      state.timer.running = false;
      state.timer.label = 'Paused';
      persistState();
      renderStage();
      updateQuestionTimerUi();
    }
  }

  function clearTimer() {
    if (timerRef) {
      window.clearInterval(timerRef);
      timerRef = null;
    }
    state.timer.running = false;
  }

  function renderAll() {
    ensureCurrentTurnValid();
    renderHeader();
    renderScoreboard();
    renderAllianceBanner();
    renderTeamColumns();
    renderBoard();
    renderStage();
    renderScreens();
    syncInputs();
  }

  function renderHeader() {
    dom.phaseLabel.textContent = state.phase === 1 ? 'Phase 1 — Free-for-all' : 'Phase 2 — 2 vs 2';
    if (state.screen === 'game' && getCurrentTeam()) {
      dom.currentTurnLabel.textContent = getCurrentTeam().name;
    } else {
      dom.currentTurnLabel.textContent = 'Lobby';
    }
    dom.miniFeed.textContent = state.feed;
    dom.soundToggleBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
    dom.soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
    dom.soundToggleBtn.classList.toggle('muted', !soundEnabled);
  }

  function renderScoreboard() {
    const currentTeamId = getCurrentTeam()?.id;
    dom.scoreboardGrid.innerHTML = state.teams.map((team) => {
      const alliance = state.phase === 2 ? getAllianceByTeamId(team.id)?.name : null;
      return `
        <article class="score-card ${team.id === currentTeamId && state.screen === 'game' ? 'active-turn' : ''}">
          <div class="score-top">
            <div>
              <div class="score-name">${escapeHtml(team.name)}</div>
              <div class="score-meta">
                <span>Score ${team.score}</span>
                <span>Streak ${team.streak}</span>
              </div>
            </div>
            <span class="score-pill">${alliance ? escapeHtml(alliance) : 'Solo'}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderAllianceBanner() {
    if (state.phase !== 2 || !state.alliances) {
      dom.allianceBanner.classList.add('hidden');
      dom.allianceBanner.innerHTML = '';
      return;
    }
    const html = state.alliances.map((alliance) => {
      const names = alliance.teamIds.map((id) => getTeamById(id)?.name || '').join(' + ');
      const totalHp = alliance.teamIds.reduce((sum, id) => sum + (getTeamById(id)?.hp || 0), 0);
      return `<div class="alliance-badge"><strong>${escapeHtml(alliance.name)}</strong><span>${escapeHtml(names)}</span><span>${totalHp} HP</span></div>`;
    }).join('');
    dom.allianceBanner.innerHTML = `<span class="eyebrow">🤝 Alliance Mode</span>${html}`;
    dom.allianceBanner.classList.remove('hidden');
  }

  function renderTeamColumns() {
    dom.leftColumn.innerHTML = [state.teams[0], state.teams[1]].map(renderTeamCard).join('');
    dom.rightColumn.innerHTML = [state.teams[2], state.teams[3]].map(renderTeamCard).join('');
  }

  function renderTeamCard(team) {
    const weapon = WEAPONS[team.weapon];
    const hpPercent = Math.max(0, (team.hp / MAX_HP) * 100);
    const currentTurn = getCurrentTeam()?.id === team.id && state.screen === 'game' && !state.flags.endgame;
    const canInteract = canInteractWithTeam(team.id);
    const alliance = state.phase === 2 ? getAllianceByTeamId(team.id)?.name || 'Independent' : 'Solo';
    const statusList = [];
    if (team.statuses.skipTurns > 0) statusList.push(`<span class="status-pill alert">💥 Skip x${team.statuses.skipTurns}</span>`);
    if (team.statuses.shield > 0) statusList.push('<span class="status-pill good">🛡 Shield ready</span>');
    if (team.statuses.reflect > 0) statusList.push('<span class="status-pill good">↩️ Reflect ready</span>');
    if (team.statuses.berserk > 0) statusList.push('<span class="status-pill good">😡 Berserk ready</span>');
    if (team.traps.c4) statusList.push(`<span class="status-pill alert">💣 C4 ${team.traps.c4.progress}/3</span>`);
    if (!statusList.length) statusList.push('<span class="status-pill">Ready</span>');

    const inventoryButtons = INVENTORY_ORDER.map((key) => {
      const meta = ITEM_META[key];
      const value = team.inventory[key];
      return `
        <button class="inventory-btn" data-use-item="${team.id}:${key}" ${canInteract && value > 0 ? '' : 'disabled'} title="${escapeHtml(meta.name)} — ${escapeHtml(meta.desc)}">
          <span class="inventory-icon">${meta.icon}</span>
          <strong>x${value}</strong>
        </button>
      `;
    }).join('');

    return `
      <article class="team-card theme-${team.theme} ${currentTurn ? 'current-turn' : ''} ${team.hp <= 0 ? 'eliminated' : ''}" data-team-card="${team.id}">
        <div class="team-header">
          <div class="team-ident">
            <div class="team-icon">${team.icon}</div>
            <div>
              <h3>${escapeHtml(team.name)}</h3>
              <div class="team-topline">${escapeHtml(alliance)} • ${escapeHtml(weapon.name)}</div>
            </div>
          </div>
          <div>
            ${currentTurn ? '<span class="turn-badge">Current Turn</span>' : ''}
            <div class="streak-badge">Streak ${team.streak}</div>
          </div>
        </div>

        <div class="hp-wrap">
          <div class="hp-row"><strong>${team.hp} HP</strong><span>${team.score} score</span></div>
          <div class="hp-track"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
        </div>

        <div class="team-mini-stats">
          <div class="mini-stat"><span>Ammo</span><strong>${team.ammo}</strong></div>
          <div class="mini-stat"><span>Cash</span><strong>$${team.money}</strong></div>
          <div class="mini-stat"><span>Damage</span><strong>${weapon.damage}</strong></div>
          <div class="mini-stat"><span>Correct</span><strong>${team.correctAnswers}</strong></div>
        </div>

        <div class="status-row">${statusList.join('')}</div>

        <div class="inventory-grid">${inventoryButtons}</div>

        <div class="card-actions">
          <span class="mini-note">${canInteract ? 'This team can use items or open the shop now.' : team.hp > 0 ? 'Stats stay visible while the center stage is open.' : 'Eliminated'}</span>
          <button class="hud-btn" data-open-shop="${team.id}" ${canInteract ? '' : 'disabled'}>Shop</button>
        </div>
      </article>
    `;
  }

  function renderBoard() {
    dom.boardGrid.innerHTML = state.board.map((tile) => {
      const isActive = state.active?.tileId === tile.id;
      const disabled = state.screen !== 'game' || tile.used || !!state.active || state.flags.endgame;
      return `
        <button class="tile-btn ${tile.used ? 'used' : ''} ${isActive ? 'active' : ''}" data-open-tile="${tile.id}" ${disabled ? 'disabled' : ''}>
          <span class="tile-index">${tile.id}</span>
          <span class="tile-type">${tile.used ? (tile.kind === 'event' ? 'Event' : 'Cleared') : 'Hidden Tile'}</span>
          ${isActive ? '<span class="tile-status">LIVE</span>' : ''}
        </button>
      `;
    }).join('');
  }

  function renderStage() {
    if (!state.active || state.screen !== 'game') {
      dom.stageOverlay.classList.add('hidden');
      dom.stageOverlay.innerHTML = '';
      dom.stageOverlay.removeAttribute('data-stage');
      lastStageSignature = '';
      return;
    }

    const signature = getStageSignature();
    dom.stageOverlay.classList.remove('hidden');
    dom.stageOverlay.dataset.stage = state.active.type;

    if (state.active.type === 'question' && lastStageSignature === signature && dom.stageOverlay.querySelector('.question-stage')) {
      updateQuestionTimerUi();
      return;
    }

    if (state.active.type === 'question') {
      dom.stageOverlay.innerHTML = renderQuestionStage();
    } else if (state.active.type === 'reward') {
      dom.stageOverlay.innerHTML = renderRewardStage();
    } else if (state.active.type === 'shop') {
      dom.stageOverlay.innerHTML = renderShopStage();
    } else if (state.active.type === 'target') {
      dom.stageOverlay.innerHTML = renderTargetStage();
    } else if (state.active.type === 'event') {
      dom.stageOverlay.innerHTML = renderEventStage();
    } else if (state.active.type === 'endgame') {
      dom.stageOverlay.innerHTML = renderEndgameStage();
    }

    lastStageSignature = signature;
    dom.stageOverlay.classList.remove('stage-swap');
    void dom.stageOverlay.offsetWidth;
    dom.stageOverlay.classList.add('stage-swap');
    if (state.active.type === 'question') {
      updateQuestionTimerUi();
    }
  }

  function renderQuestionStage() {
    const active = state.active;
    const question = getQuestionById(active.questionId);
    if (!question) return '';
    const responder = active.responderId ? getTeamById(active.responderId) : null;
    const optionDisabled = !['main', 'steal'].includes(active.mode);
    const timer = getQuestionTimerMeta(active.mode);
    const statusLine = active.mode === 'main'
      ? `${getTeamById(active.turnOwnerId)?.name || 'Current team'} is answering now.`
      : active.mode === 'steal'
        ? `${responder?.name || 'Selected team'} has 5 seconds to steal the point.`
        : 'Choose one of the other three teams to attempt the steal turn.';

    const optionsHtml = Object.entries(question.options).map(([letter, choiceText]) => {
      const classes = ['option-btn'];
      if (active.lastPick && active.lastPick.choice === letter) {
        classes.push(active.lastPick.correct ? 'correct' : 'wrong');
      } else if (active.answerShown && question.correct === letter) {
        classes.push('correct');
      }
      return `
        <button class="${classes.join(' ')}" data-answer-choice="${letter}" ${optionDisabled ? 'disabled' : ''}>
          <span class="choice-letter">${letter}</span>
          <span>${escapeHtml(choiceText)}</span>
        </button>
      `;
    }).join('');

    const stealButtons = active.mode === 'steal-pick'
      ? `
        <div class="steal-row">
          ${state.teams.filter((team) => team.id !== active.turnOwnerId).map((team) => {
            const available = active.stealPool.includes(team.id) && team.hp > 0 && team.statuses.skipTurns <= 0;
            return `
              <button class="steal-btn" data-steal-team="${team.id}" ${available ? '' : 'disabled'}>
                <strong>${escapeHtml(team.name)}</strong>
                <small>${available ? `HP ${team.hp} • Ammo ${team.ammo}` : team.hp <= 0 ? 'Eliminated' : 'Unavailable'}</small>
              </button>
            `;
          }).join('')}
        </div>
      `
      : '';

    return `
      <div class="stage-card question-stage">
        <div class="stage-top">
          <div>
            <span class="eyebrow">❓ Tile ${active.tileId}</span>
            <h2>Question ${question.id}</h2>
            <div class="stage-meta">${escapeHtml(statusLine)}</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill">${escapeHtml(question.category)}</span>
            <span class="stage-pill">${escapeHtml(responder?.name || 'No team selected')}</span>
            <span class="stage-pill timer ${timer.isLow ? 'low' : ''}" data-timer-pill>${escapeHtml(timer.label)}: ${escapeHtml(timer.value)}</span>
          </div>
        </div>

        <div class="question-body">
          <div class="question-box">
            <div class="timer-track">
              <div class="timer-fill ${timer.isLow ? 'low' : ''}" data-timer-bar style="width:${timer.percent}%"></div>
            </div>
            <p class="question-text">${escapeHtml(question.prompt)}</p>
          </div>

          ${stealButtons}

          <div class="option-grid">${optionsHtml}</div>

          <div class="answer-box ${active.answerShown ? '' : 'hidden'}">
            <strong>Correct answer: ${question.correct}. ${escapeHtml(question.options[question.correct])}</strong>
            <span>${escapeHtml(question.explanation)}</span>
          </div>
        </div>

        <div class="inline-actions">
          <button class="hud-btn" data-stage-action="restart-timer">Restart Timer</button>
          <button class="hud-btn" data-stage-action="pause-timer">Pause</button>
          <button class="hud-btn" data-stage-action="toggle-answer">Show / Hide Answer</button>
          <button class="hud-btn" data-stage-action="skip-tile">End Tile</button>
        </div>
      </div>
    `;
  }

  function renderRewardStage() {
    const active = state.active;
    const team = getTeamById(active.teamId);
    if (!team) return '';
    const crateRow = active.crateChoices ? `
      <div class="crate-row">
        ${active.crateChoices.map((key) => {
          const entry = CRATE_REWARDS.find((reward) => reward.key === key);
          return `
            <button class="crate-card" data-crate-key="${entry.key}" ${active.crateChosen ? 'disabled' : ''}>
              <strong>${escapeHtml(entry.title)}</strong>
              <small>${escapeHtml(entry.desc)}</small>
            </button>
          `;
        }).join('')}
      </div>
    ` : '';
    const needsCrate = active.crateChoices && !active.crateChosen;

    return `
      <div class="stage-card">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🏆 Reward Menu</span>
            <h2>${escapeHtml(team.name)} answered correctly</h2>
            <div class="stage-meta">Choose the next action for this team.</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill">+$${active.moneyAward}</span>
            <span class="stage-pill">+${active.ammoAward} ammo</span>
            <span class="stage-pill">+${active.scoreAward} score</span>
          </div>
        </div>

        <div class="reward-box">
          <div class="reward-notes">
            <span class="status-pill">HP ${team.hp}</span>
            <span class="status-pill">Ammo ${team.ammo}</span>
            <span class="status-pill">Cash $${team.money}</span>
            <span class="status-pill">${escapeHtml(WEAPONS[team.weapon].name)}</span>
            ${active.notes.map((note) => `<span class="status-pill">${escapeHtml(note)}</span>`).join('')}
          </div>
        </div>

        ${crateRow}

        <div class="reward-actions">
          <button class="reward-btn primary" data-stage-action="reward-attack" ${needsCrate ? 'disabled' : ''}>
            <strong>Attack</strong>
            <small>Shoot another team.</small>
          </button>
          <button class="reward-btn" data-stage-action="reward-ammo" ${needsCrate ? 'disabled' : ''}>
            <strong>+1 Ammo</strong>
            <small>Save more firepower.</small>
          </button>
          <button class="reward-btn" data-stage-action="reward-heal" ${needsCrate ? 'disabled' : ''}>
            <strong>Heal 15 HP</strong>
            <small>Stabilize your squad.</small>
          </button>
          <button class="reward-btn" data-stage-action="reward-shop" ${needsCrate ? 'disabled' : ''}>
            <strong>Shop</strong>
            <small>Buy upgrades and items.</small>
          </button>
        </div>
      </div>
    `;
  }

  function renderShopStage() {
    const active = state.active;
    const team = getTeamById(active.teamId);
    if (!team) return '';

    const weaponHtml = WEAPONS.map((weapon, index) => {
      const owned = index <= team.weapon;
      const available = index === team.weapon + 1 && team.money >= weapon.price;
      return `
        <div class="shop-entry">
          <strong>${escapeHtml(weapon.name)}</strong>
          <small>${escapeHtml(weapon.desc)}</small>
          <div class="store-lines">
            <span class="status-pill">Damage ${weapon.damage}</span>
            <span class="status-pill">$${weapon.price}</span>
          </div>
          <div class="buy-row">
            <small>${owned ? (index === team.weapon ? 'Equipped' : 'Owned') : available ? 'Ready to buy' : 'Locked'}</small>
            <button class="shop-btn inline ${available ? 'primary' : ''}" data-buy-item="weapon:${index}" ${available ? '' : 'disabled'}>Buy</button>
          </div>
        </div>
      `;
    }).join('');

    const itemHtml = SHOP_ITEMS.map((item) => {
      const canBuy = team.money >= item.price;
      return `
        <div class="shop-entry">
          <strong>${item.icon} ${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.desc)}</small>
          <div class="store-lines">
            <span class="status-pill">$${item.price}</span>
            <span class="status-pill">${item.type === 'instant' ? 'Instant' : 'Inventory'}</span>
          </div>
          <div class="buy-row">
            <small>${canBuy ? 'Ready to buy' : 'Need more cash'}</small>
            <button class="shop-btn inline ${canBuy ? 'primary' : ''}" data-buy-item="item:${item.key}" ${canBuy ? '' : 'disabled'}>Buy</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="stage-card">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🛒 Shop</span>
            <h2>${escapeHtml(team.name)} Loadout Terminal</h2>
            <div class="stage-meta">Buy upgrades and close the shop when you are done.</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill">Cash $${team.money}</span>
            <span class="stage-pill">Ammo ${team.ammo}</span>
            <span class="stage-pill">${escapeHtml(WEAPONS[team.weapon].name)}</span>
          </div>
        </div>

        <div class="shop-grid">
          <div class="shop-column">
            <div class="question-box"><strong>Weapon Upgrades</strong></div>
            <div class="shop-list">${weaponHtml}</div>
          </div>
          <div class="shop-column">
            <div class="question-box"><strong>Utility Items</strong></div>
            <div class="shop-list">${itemHtml}</div>
          </div>
        </div>

        <div class="inline-actions">
          <button class="hud-btn primary" data-stage-action="close-shop">Done</button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
        </div>
      </div>
    `;
  }

  function renderTargetStage() {
    const active = state.active;
    const source = getTeamById(active.sourceTeamId);
    return `
      <div class="stage-card">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🎯 Target Select</span>
            <h2>${escapeHtml(active.title)}</h2>
            <div class="stage-meta">${escapeHtml(active.description)}</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill">Acting team: ${escapeHtml(source?.name || 'Unknown')}</span>
          </div>
        </div>

        <div class="target-grid">
          ${active.targetIds.map((id) => {
            const team = getTeamById(id);
            if (!team) return '';
            return `
              <button class="target-btn" data-target-team="${team.id}">
                <strong>${escapeHtml(team.name)}</strong>
                <small>HP ${team.hp} • Ammo ${team.ammo} • Cash $${team.money}</small>
                <small>${escapeHtml(WEAPONS[team.weapon].name)}</small>
              </button>
            `;
          }).join('')}
        </div>

        <div class="inline-actions">
          <button class="hud-btn" data-stage-action="cancel-target">Back</button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
        </div>
      </div>
    `;
  }

  function renderEventStage() {
    const active = state.active;
    const team = getTeamById(active.teamId);
    return `
      <div class="stage-card">
        <div class="stage-top">
          <div>
            <span class="eyebrow">✨ Event Tile</span>
            <h2>${escapeHtml(active.title)}</h2>
            <div class="stage-meta">${escapeHtml(team?.name || 'A team')} triggered a hidden event tile.</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill">Tile bonus</span>
          </div>
        </div>

        <div class="reward-box">
          <div class="reward-notes">
            <span class="status-pill good">${escapeHtml(active.message)}</span>
          </div>
        </div>

        <div class="inline-actions">
          <button class="hud-btn primary" data-stage-action="close-event">Continue</button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
        </div>
      </div>
    `;
  }

  function renderEndgameStage() {
    if (state.phase === 1) {
      const ranking = [...state.teams].sort((a, b) => (b.hp - a.hp) || (b.score - a.score));
      const winner = ranking[0];
      const tied = ranking[1] && ranking[0].hp === ranking[1].hp && ranking[0].score === ranking[1].score;
      return `
        <div class="stage-card">
          <div class="stage-top">
            <div>
              <span class="eyebrow">🏆 Match Over</span>
              <h2>${tied ? 'Tie Game' : `${escapeHtml(winner.name)} wins`}</h2>
              <div class="stage-meta">${tied ? 'The top teams finished with the same HP and score. Use a tie-breaker question if you want.' : `${escapeHtml(winner.name)} survived with ${winner.hp} HP and ${winner.score} score.`}</div>
            </div>
          </div>

          <div class="target-grid">
            ${ranking.map((team) => `
              <div class="target-btn">
                <strong>${escapeHtml(team.name)}</strong>
                <small>HP ${team.hp} • Score ${team.score} • Cash $${team.money}</small>
                <small>${escapeHtml(WEAPONS[team.weapon].name)} • Correct ${team.correctAnswers}</small>
              </div>
            `).join('')}
          </div>

          <div class="inline-actions">
            <button class="hud-btn primary" data-stage-action="restart-match">New Match</button>
            <button class="hud-btn" disabled></button>
            <button class="hud-btn" disabled></button>
            <button class="hud-btn" disabled></button>
          </div>
        </div>
      `;
    }

    const alliances = getAllianceStats().sort((a, b) => (b.totalHp - a.totalHp) || (b.totalScore - a.totalScore));
    const winner = alliances[0];
    const tied = alliances[1] && alliances[0].totalHp === alliances[1].totalHp && alliances[0].totalScore === alliances[1].totalScore;
    return `
      <div class="stage-card">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🏆 Match Over</span>
            <h2>${tied ? 'Alliance Tie' : `${escapeHtml(winner.name)} wins`}</h2>
            <div class="stage-meta">${tied ? 'Both alliances finished with the same HP and score. A tie-breaker question would settle it.' : `${escapeHtml(winner.name)} won with ${winner.totalHp} combined HP.`}</div>
          </div>
        </div>

        <div class="target-grid">
          ${alliances.map((alliance) => `
            <div class="target-btn">
              <strong>${escapeHtml(alliance.name)}</strong>
              <small>${escapeHtml(alliance.members.map((team) => team.name).join(' + '))}</small>
              <small>Total HP ${alliance.totalHp} • Total Score ${alliance.totalScore}</small>
            </div>
          `).join('')}
        </div>

        <div class="inline-actions">
          <button class="hud-btn primary" data-stage-action="restart-match">New Match</button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
          <button class="hud-btn" disabled></button>
        </div>
      </div>
    `;
  }

  function renderScreens() {
    dom.setupScreen.classList.toggle('hidden', state.screen !== 'setup');
    dom.rulesScreen.classList.toggle('hidden', state.screen !== 'rules');
  }

  function canInteractWithTeam(teamId) {
    return state.screen === 'game' && !state.active && !state.flags.endgame && getCurrentTeam()?.id === teamId && getTeamById(teamId)?.hp > 0;
  }

  function getStealCandidates(turnOwnerId) {
    return state.teams
      .filter((team) => team.id !== turnOwnerId)
      .filter((team) => team.hp > 0)
      .filter((team) => team.statuses.skipTurns <= 0)
      .map((team) => team.id);
  }

  function getEnemyTargets(sourceTeamId) {
    const sourceAlliance = getAllianceByTeamId(sourceTeamId);
    return getAliveTeams().filter((team) => team.id !== sourceTeamId).filter((team) => {
      if (state.phase !== 2) return true;
      const targetAlliance = getAllianceByTeamId(team.id);
      return !sourceAlliance || !targetAlliance || sourceAlliance.name !== targetAlliance.name;
    });
  }

  function getAllianceStats() {
    return (state.alliances || []).map((alliance) => {
      const members = alliance.teamIds.map((id) => getTeamById(id)).filter(Boolean);
      return {
        name: alliance.name,
        members,
        totalHp: members.reduce((sum, team) => sum + team.hp, 0),
        totalScore: members.reduce((sum, team) => sum + team.score, 0),
        alive: members.some((team) => team.hp > 0)
      };
    });
  }

  function getCurrentTeam() {
    return state.teams[state.currentTurnIndex] || null;
  }

  function getQuestionById(questionId) {
    return state.questions.find((question) => question.id === questionId) || null;
  }

  function getTileById(tileId) {
    return state.board.find((tile) => tile.id === tileId) || null;
  }

  function getTeamById(teamId) {
    return state.teams.find((team) => team.id === teamId) || null;
  }

  function getAliveTeams() {
    return state.teams.filter((team) => team.hp > 0);
  }

  function getAllianceByTeamId(teamId) {
    if (!state.alliances) return null;
    return state.alliances.find((alliance) => alliance.teamIds.includes(teamId)) || null;
  }

  function getStageSignature() {
    if (!state.active || state.screen !== 'game') return '';
    if (state.active.type === 'question') {
      return JSON.stringify({
        type: state.active.type,
        tileId: state.active.tileId,
        questionId: state.active.questionId,
        mode: state.active.mode,
        responderId: state.active.responderId,
        answerShown: state.active.answerShown,
        lastPick: state.active.lastPick,
        stealPool: state.active.stealPool
      });
    }
    return JSON.stringify(state.active);
  }

  function getQuestionTimerMeta(mode = state.active?.mode) {
    const isPick = mode === 'steal-pick';
    const seconds = Math.max(0, state.timer?.seconds || 0);
    const maxSeconds = Math.max(1, state.timer?.maxSeconds || (mode === 'steal' ? STEAL_TIMER : MAIN_TIMER));
    const label = mode === 'main' ? 'Main Turn' : mode === 'steal' ? 'Steal Turn' : 'Choose Steal Team';
    const value = isPick ? 'Pick team' : `${seconds}s`;
    const percent = isPick ? 0 : Math.max(0, Math.min(100, (seconds / maxSeconds) * 100));
    return { label, value, percent, isLow: !isPick && seconds <= 5 };
  }

  function updateQuestionTimerUi() {
    if (state.active?.type !== 'question') return;
    const pill = dom.stageOverlay.querySelector('[data-timer-pill]');
    const bar = dom.stageOverlay.querySelector('[data-timer-bar]');
    if (!pill && !bar) return;
    const timer = getQuestionTimerMeta();
    if (pill) {
      pill.textContent = `${timer.label}: ${timer.value}`;
      pill.classList.toggle('low', timer.isLow);
    }
    if (bar) {
      bar.style.width = `${timer.percent}%`;
      bar.classList.toggle('low', timer.isLow);
    }
  }

  function pulseTeamCard(teamId, pulseClass = 'pulse-danger') {
    const node = document.querySelector(`[data-team-card="${teamId}"]`);
    if (!node) return;
    node.classList.remove('pulse-danger', 'pulse-warn', 'pulse-success');
    void node.offsetWidth;
    node.classList.add(pulseClass);
    window.setTimeout(() => node.classList.remove(pulseClass), 650);
  }

  function triggerArenaFlash(kind = 'info') {
    document.body.classList.remove('fx-info', 'fx-success', 'fx-warn', 'fx-danger');
    void document.body.offsetWidth;
    document.body.classList.add(`fx-${kind}`);
    window.setTimeout(() => {
      document.body.classList.remove(`fx-${kind}`);
    }, 520);
  }

  function loadSoundPreference() {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY);
    return raw == null ? true : raw !== 'false';
  }

  function saveSoundPreference() {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      bootstrapAudio();
      playSfx('ui');
    }
    saveSoundPreference();
    renderHeader();
  }

  function bootstrapAudio() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return null;
      audioCtx = new Context();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playSfx(name) {
    const ctx = bootstrapAudio();
    if (!ctx) return;
    if (name === 'ui') {
      playTone(ctx, { frequency: 720, duration: 0.05, gain: 0.03, type: 'triangle' });
      return;
    }
    if (name === 'start') {
      playTone(ctx, { frequency: 392, duration: 0.09, gain: 0.035, type: 'triangle' });
      playTone(ctx, { frequency: 523.25, duration: 0.1, gain: 0.04, type: 'triangle', delay: 0.07 });
      playTone(ctx, { frequency: 659.25, duration: 0.12, gain: 0.045, type: 'triangle', delay: 0.14 });
      return;
    }
    if (name === 'tile-open') {
      playTone(ctx, { frequency: 480, duration: 0.05, gain: 0.025, slideTo: 660, type: 'sine' });
      return;
    }
    if (name === 'event') {
      playTone(ctx, { frequency: 520, duration: 0.06, gain: 0.03, slideTo: 860, type: 'triangle' });
      playTone(ctx, { frequency: 860, duration: 0.07, gain: 0.025, delay: 0.05, type: 'triangle' });
      return;
    }
    if (name === 'correct') {
      playTone(ctx, { frequency: 523.25, duration: 0.07, gain: 0.035, type: 'triangle' });
      playTone(ctx, { frequency: 659.25, duration: 0.08, gain: 0.04, delay: 0.05, type: 'triangle' });
      playTone(ctx, { frequency: 783.99, duration: 0.1, gain: 0.045, delay: 0.11, type: 'triangle' });
      return;
    }
    if (name === 'wrong') {
      playTone(ctx, { frequency: 310, duration: 0.09, gain: 0.035, slideTo: 220, type: 'sawtooth' });
      return;
    }
    if (name === 'timeout') {
      playTone(ctx, { frequency: 260, duration: 0.08, gain: 0.03, type: 'square' });
      playTone(ctx, { frequency: 210, duration: 0.11, gain: 0.028, delay: 0.08, type: 'square' });
      return;
    }
    if (name === 'steal-start') {
      playTone(ctx, { frequency: 440, duration: 0.05, gain: 0.025, type: 'square' });
      playTone(ctx, { frequency: 554.37, duration: 0.05, gain: 0.025, delay: 0.05, type: 'square' });
      return;
    }
    if (name === 'tick') {
      playTone(ctx, { frequency: 980, duration: 0.03, gain: 0.015, type: 'square' });
      return;
    }
    if (name === 'attack-hit') {
      playNoise(ctx, { duration: 0.05, gain: 0.028 });
      playTone(ctx, { frequency: 160, duration: 0.08, gain: 0.03, type: 'sawtooth' });
      return;
    }
    if (name === 'attack-block') {
      playTone(ctx, { frequency: 260, duration: 0.05, gain: 0.025, type: 'square' });
      playTone(ctx, { frequency: 180, duration: 0.05, gain: 0.02, delay: 0.05, type: 'square' });
      return;
    }
    if (name === 'utility') {
      playTone(ctx, { frequency: 640, duration: 0.06, gain: 0.025, type: 'triangle' });
      playTone(ctx, { frequency: 880, duration: 0.05, gain: 0.02, delay: 0.05, type: 'triangle' });
      return;
    }
    if (name === 'trap') {
      playTone(ctx, { frequency: 180, duration: 0.06, gain: 0.03, type: 'sawtooth' });
      playTone(ctx, { frequency: 140, duration: 0.08, gain: 0.025, delay: 0.06, type: 'sawtooth' });
      return;
    }
    if (name === 'phase') {
      playTone(ctx, { frequency: 330, duration: 0.08, gain: 0.03, type: 'square' });
      playTone(ctx, { frequency: 392, duration: 0.08, gain: 0.032, delay: 0.06, type: 'square' });
      playTone(ctx, { frequency: 523.25, duration: 0.12, gain: 0.04, delay: 0.14, type: 'triangle' });
    }
  }

  function playTone(ctx, { frequency, duration = 0.08, gain = 0.03, type = 'sine', delay = 0, slideTo = null }) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    }
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playNoise(ctx, { duration = 0.05, gain = 0.02, delay = 0 }) {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
    }
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const start = ctx.currentTime + delay;
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(gain, start);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(start);
    source.stop(start + duration);
  }

  function persistState() {
    const snapshot = JSON.parse(JSON.stringify(state));
    if (snapshot.timer) snapshot.timer.running = false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  function restoreState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || ![3, 4].includes(parsed.version)) return false;
      state = parsed;
      clearTimer();
      if (!state.timer) state.timer = { seconds: 0, maxSeconds: 0, label: 'Ready', running: false };
      state.timer.running = false;
      state.timer.maxSeconds = state.timer.maxSeconds || state.timer.seconds || 0;
      if (!state.flags) state.flags = { endgame: false };
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function clearSave() {
    window.localStorage.removeItem(STORAGE_KEY);
    triggerArenaFlash('info');
    toast('Save cleared', 'The autosave has been removed.', 'info');
  }

  function toast(title, message, kind) {
    const node = document.createElement('article');
    node.className = `toast ${kind}`;
    node.innerHTML = `<strong>${escapeHtml(title)}</strong><div>${escapeHtml(message)}</div>`;
    dom.toastHost.appendChild(node);
    window.setTimeout(() => {
      node.remove();
    }, 3000);
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sampleMany(list, count) {
    return shuffle(list).slice(0, count);
  }

  function pickUniqueIndexes(length, count) {
    const indexes = Array.from({ length }, (_, index) => index);
    return shuffle(indexes).slice(0, count);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
