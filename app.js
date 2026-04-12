(() => {
  
const STORAGE_KEY = 'english-battle-royale-v8';
const SOUND_STORAGE_KEY = 'english-battle-royale-sound-enabled';
const DEFAULT_NAMES = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];
const MAX_HP = 300;
const MAIN_TIMER = 15;
const STEAL_TIMER = 8;
const MONEY_REWARD_MIN = 35;
const MONEY_REWARD_MAX = 100;
const MAIN_REWARD_AMMO = 1;
const MAIN_REWARD_SCORE = 10;
const STEAL_REWARD_SCORE = 8;
const HEAL_REWARD = 15;
const TOTAL_TILES = 28;
const EVENT_TILE_COUNT = 4;
const QUESTION_TARGET = 24;
const PUNISHMENT_VIDEO_EMBED = 'https://www.youtube.com/embed/OerUZMrp2l0?autoplay=1&rel=0';
const PHASE_TWO_TRIGGER = 14;
const PHASE_TWO_HP_TRIGGER = 150;
const COMBO_ITEM_KEYS = ['shield', 'reflect', 'flashbang', 'berserk'];

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
    { key: 'awm', name: 'Mini-gun', damage: 45, price: 300, desc: 'High-output heavy weapon that can fire multiple bullets per turn.', pierceShield: false }
  ];

  
const ITEM_META = {
  medkit: { icon: '🧰', name: 'Medkit', desc: 'Heal 50 HP instantly.', instant: true, comboWithAttack: false },
  shield: { icon: '🛡️', name: 'Shield', desc: 'Blocks 2 bullets except Mini-gun shots and lasts for 2 turns.', instant: true, comboWithAttack: true },
  flashbang: { icon: '💥', name: 'Flashbang', desc: 'Choose an enemy team to lose its next turn.', instant: false, comboWithAttack: true },
  reflect: { icon: '↩️', name: 'Reflect', desc: 'Reflects 70% of the next non-Mini-gun gun damage.', instant: true, comboWithAttack: true },
  berserk: { icon: '😡', name: 'Berserk', desc: 'Next attack is free and gains +25 total damage, but costs 30 HP.', instant: true, comboWithAttack: true },
  c4: { icon: '💣', name: 'C4', desc: 'Plant a bomb on an enemy team. They must answer 4 times correctly in a row to defuse it.', instant: false, comboWithAttack: false },
  thief: { icon: '🦹', name: 'Thief Card', desc: 'Steal $50 and 1 ammo from any enemy team.', instant: false, comboWithAttack: false }
};

  const INVENTORY_ORDER = ['medkit', 'shield', 'flashbang', 'reflect', 'berserk', 'c4', 'thief'];

  
const SHOP_ITEMS = [
  { key: 'ammo', name: '+1 Ammo', icon: '🔸', price: 50, type: 'instant', desc: 'Buy 1 extra ammo immediately.' },
  { key: 'medkit', name: 'Medkit', icon: '🧰', price: 150, type: 'inventory', desc: 'Store a kit that heals 50 HP.' },
  { key: 'shield', name: 'Shield', icon: '🛡️', price: 120, type: 'inventory', desc: 'Block 2 bullets except Mini-gun shots for 2 turns.' },
  { key: 'flashbang', name: 'Flashbang', icon: '💥', price: 130, type: 'inventory', desc: 'Choose one team to skip next turn.' }
];

  const EVENT_TEMPLATES = [
    {
      key: 'supply-drop',
      title: 'Supply Drop',
      apply(team) {
        changeMoney(team, 50);
        team.ammo += 1;
        return `${team.name} opened a Supply Drop and gained +$50 and +1 ammo.`;
      }
    },
    {
      key: 'field-medic',
      title: 'Field Medic',
      apply(team) {
        const before = team.hp;
        changeHp(team, 25);
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
        changeMoney(team, 100);
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
        changeHp(team, 35);
        return `${team.name} recovered ${team.hp - before} HP from the support crate.`;
      }
    },
    {
      key: 'crate-ammo',
      title: 'Ammo Rain',
      desc: '+2 ammo and +$60.',
      apply(team) {
        team.ammo += 2;
        changeMoney(team, 60);
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
        changeMoney(team, 100);
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
        changeMoney(team, 50);
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
  let bgMusicTimer = null;
  let bgMusicSeed = 0;
  let lastStageSignature = '';
  let floatingStatSeq = 0;
  let phaseFxTimer = null;
  let state = createState(DEFAULT_NAMES, 'setup');


  init();

  function showFloatingStat(teamId, type, delta) {
    if (!delta) return;
    const card = document.querySelector(`[data-team-card="${teamId}"]`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const node = document.createElement('div');
    const amountText = type === 'money'
      ? `${delta > 0 ? '+' : '-'}$${Math.abs(delta)}`
      : type === 'score'
        ? `${delta > 0 ? '+' : '-'}${Math.abs(delta)} SCORE`
        : `${delta > 0 ? '+' : '-'}${Math.abs(delta)} HP`;
    node.className = `floating-stat ${type} ${delta > 0 ? 'gain' : 'loss'}`;
    node.textContent = amountText;
    const topOffset = type === 'money' ? 102 : type === 'score' ? 146 : 54;
    node.style.left = `${rect.right - 152}px`;
    node.style.top = `${rect.top + topOffset}px`;
    node.style.setProperty('--float-seq', String(floatingStatSeq % 3));
    floatingStatSeq += 1;
    document.body.appendChild(node);
    requestAnimationFrame(() => node.classList.add('show'));
    window.setTimeout(() => {
      node.classList.remove('show');
      node.classList.add('hide');
      window.setTimeout(() => node.remove(), 260);
    }, 1200);
  }
  function changeMoney(team, delta) {
    if (!team || !delta) return 0;
    const before = team.money;
    team.money = Math.max(0, team.money + delta);
    const applied = team.money - before;
    if (applied) showFloatingStat(team.id, 'money', applied);
    return applied;
  }

  function changeHp(team, delta) {
    if (!team || !delta) return 0;
    const before = team.hp;
    team.hp = clamp(team.hp + delta, 0, MAX_HP);
    const applied = team.hp - before;
    if (applied) showFloatingStat(team.id, 'hp', applied);
    return applied;
  }

  function changeScore(team, delta) {
    if (!team || !delta) return 0;
    const before = team.score;
    team.score = Math.max(0, team.score + delta);
    const applied = team.score - before;
    if (applied) showFloatingStat(team.id, 'score', applied);
    return applied;
  }

  function changeScore(team, delta) {
    if (!team || !delta) return 0;
    const before = team.score;
    team.score = Math.max(0, team.score + delta);
    const applied = team.score - before;
    if (applied) showFloatingStat(team.id, 'score', applied);
    return applied;
  }
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
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopBackgroundMusic();
      } else {
        syncBackgroundMusic();
      }
    });
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
    document.getElementById('endGameBtn').addEventListener('click', forceEndGame);
    document.getElementById('endGameBtn').addEventListener('click', forceEndGame);
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

  const shopTabButton = event.target.closest('[data-shop-tab]');
  if (shopTabButton) {
    setShopTab(shopTabButton.dataset.shopTab);
    return;
  }

  const adjustButton = event.target.closest('[data-attack-adjust]');
  if (adjustButton) {
    const [teamId, deltaRaw] = adjustButton.dataset.attackAdjust.split(':');
    adjustAttackPlan(teamId, Number(deltaRaw));
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
    version: 8,
    screen,
    teams: createTeams(safeNames),
    questions,
    board: buildBoard(questions),
    currentTurnIndex: 0,
    turnSerial: 1,
    phase: 1,
    alliances: null,
    active: null,
    timer: { seconds: 0, maxSeconds: 0, label: 'Ready', running: false },
    feed: 'Open a tile to begin the match.',
    flags: { endgame: false, victorySfxPlayed: false }
  };
}

function createTeams(names) {
  return names.map((name, index) => ({
    id: `team-${index + 1}`,
    name,
    icon: TEAM_META[index].icon,
    theme: TEAM_META[index].theme,
    hp: MAX_HP,
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
      shieldCharges: 0,
      shieldActive: false,
      shieldTurns: 0,
      reflect: 0,
      reflectActive: false,
      berserk: 0,
      berserkActive: false,
      phaseBoostTurns: 0,
      phaseBoostMultiplier: 1
    },
    traps: {
      c4: null
    },
    lastItemTurn: -1,
    lastItemKey: null,
    lastItemComboAllowed: true
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
    bootstrapAudio();
    state = createState(names, 'game');
    state.feed = `Current turn: ${getCurrentTeam().name}. Open any hidden tile to start.`;
    persistState();
    renderAll();
    syncBackgroundMusic();
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
      toast('Steal round', 'Choose one of the other teams for the 8-second steal turn.', 'warn');
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
  const rewardMoney = getRandomInt(MONEY_REWARD_MIN, MONEY_REWARD_MAX);
  const rewardAmmo = isSteal ? 0 : MAIN_REWARD_AMMO;
  const rewardScore = isSteal ? STEAL_REWARD_SCORE : MAIN_REWARD_SCORE;

  const notes = registerAnswerResult(team.id, true);
  changeMoney(team, rewardMoney);
  team.ammo += rewardAmmo;
  changeScore(team, rewardScore);
  team.correctAnswers += 1;

  const tile = getTileById(active.tileId);
  if (tile) tile.used = true;

  clearTimer();

  let crateChoices = null;
  if (team.streak > 0 && team.streak % 3 === 0) {
    crateChoices = createMysteryCrates(3);
    notes.push(`${team.name} hit a ${team.streak}-answer streak and unlocked 3 mystery crates.`);
    toast('STREAK x3!', `${team.name} unlocked 3 mystery crates. Pick 1 and keep the turn.`, 'success', { bigCenter: true });
    playSfx('streak-crate');
  }

  state.active = {
    type: 'reward',
    teamId: team.id,
    moneyAward: rewardMoney,
    ammoAward: rewardAmmo,
    scoreAward: rewardScore,
    crateChoices,
    crateChosen: false,
    notes,
    turnItemKey: team.lastItemTurn === state.turnSerial ? (team.lastItemKey || getTurnItemLabel(team)) : null,
    attackBlockedByItem: team.lastItemTurn === state.turnSerial ? !team.lastItemComboAllowed : false
  };
  state.timer = { seconds: 0, maxSeconds: 0, label: 'Reward Menu', running: false };
  state.feed = `${team.name} answered correctly and can now choose a reward action.`;
  persistState();
  renderAll();
  triggerArenaFlash('success');
  playSfx('correct');
  toast('Correct answer', `${team.name} earned $${rewardMoney}${rewardAmmo ? ` and +${rewardAmmo} ammo` : ''}.`, 'success');
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

  if (action === 'back-from-shop') {
    returnFromShop();
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

if (action === 'confirm-attack') {
  confirmAttackPlan();
  return;
}

if (action === 'clear-attack') {
  resetAttackPlan();
  return;
}

if (action === 'open-punishment-video') {
    state.flags.showPunishmentVideo = true;
    persistState();
    renderStage();
    return;
  }

if (action === 'close-punishment-video') {
    state.flags.showPunishmentVideo = false;
    persistState();
    renderStage();
    return;
  }
if (action === 'restart-match') {
    openSetupFlow();
    return;
  }

  if (action === 'open-secret-video') {
    openSecretVideo();
    return;
  }
}



  
function beginRewardAttack() {
  if (state.active?.type !== 'reward') return;
  const team = getTeamById(state.active.teamId);
  if (!team) return;
  if (state.active.crateChoices && !state.active.crateChosen) {
    toast('Claim the crate first', 'Pick one of the mystery crates before attacking.', 'warn');
    return;
  }
  if (state.active.attackBlockedByItem) {
    toast('Attack locked', 'The item used this turn does not combine with Attack.', 'warn');
    return;
  }

  const maxShots = getAttackCapacity(team);
  if (maxShots <= 0) {
    toast('No ammo ready', `${team.name} does not have enough ammo for an attack.`, 'warn');
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
    title: `Plan the attack for ${team.name}`,
    description: `${WEAPONS[team.weapon].name} deals ${WEAPONS[team.weapon].damage} damage per bullet${WEAPONS[team.weapon].pierceShield ? ' and pierces shields' : ''}${isBurstWeapon(WEAPONS[team.weapon]) ? ' and can fire multiple bullets in one turn' : ''}.`,
    targetIds: targets.map((entry) => entry.id),
    allocations: Object.fromEntries(targets.map((entry) => [entry.id, 0])),
    maxShots,
    burst: isBurstWeapon(WEAPONS[team.weapon]),
    freeAttack: team.statuses.berserk > 0,
    bonusDamage: team.statuses.berserk > 0 ? 25 : 0
  };
  persistState();
  renderAll();
  playSfx('ui');
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
    const healed = changeHp(team, HEAL_REWARD);
    state.feed = `${team.name} healed ${healed} HP.`;
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Heal used', `${team.name} recovered ${healed} HP.`, 'success');
    state.active = null;
    finalizeTurn();
  }

  
  function chooseCrate(crateKey) {
    if (state.active?.type !== 'reward' || !state.active.crateChoices || state.active.crateChosen) return;
    const team = getTeamById(state.active.teamId);
    const crate = state.active.crateChoices.find((entry) => entry.id === crateKey);
    if (!team || !crate) return;

    const result = applyMysteryReward(team, crate.reward);
    state.active.crateChosen = true;
    state.active.notes.push(result);
    state.feed = result;
    persistState();
    renderAll();
    triggerArenaFlash('success');
    playSfx('utility');
    toast('MYSTERY CRATE', result, 'success', { bigCenter: true });
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
  const returnTo = fromReward && state.active?.type === 'reward'
    ? JSON.parse(JSON.stringify(state.active))
    : null;
  state.active = {
    type: 'shop',
    teamId,
    fromReward,
    tab: 'weapons',
    returnTo
  };
  persistState();
  renderAll();
  playSfx('ui');
}

function setShopTab(tab) {
  if (state.active?.type !== 'shop') return;
  if (!['weapons', 'items'].includes(tab)) return;
  state.active.tab = tab;
  persistState();
  renderStage();
  playSfx('ui');
}

function returnFromShop() {
  if (state.active?.type !== 'shop') return;
  const team = getTeamById(state.active.teamId);
  if (state.active.returnTo) {
    state.active = state.active.returnTo;
    state.feed = `${team?.name || 'The team'} left the shop and returned to the reward menu.`;
    persistState();
    renderAll();
    playSfx('ui');
    return;
  }
  state.active = null;
  state.feed = `${team?.name || 'The team'} closed the shop.`;
  persistState();
  renderAll();
  playSfx('ui');
}

function closeShop() {
  if (state.active?.type !== 'shop') return;
  const fromReward = state.active.fromReward;
  const teamId = state.active.teamId;
  const teamName = getTeamById(teamId)?.name || 'The team';
  state.active = null;
  if (fromReward) {
    state.feed = `${teamName} finished shopping and ended the turn.`;
    finalizeTurn();
  } else {
    state.feed = `${teamName} finished shopping.`;
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
    changeMoney(team, -weapon.price);
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
    changeMoney(team, -item.price);
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
  if (!canUseInventoryDuringTurn(teamId)) return;
  if (team.lastItemTurn === state.turnSerial) {
    toast('Item limit reached', `${team.name} can only use 1 item this turn.`, 'warn');
    return;
  }

  if (['shield', 'reflect', 'berserk'].includes(itemKey) && team.statuses[`${itemKey}Active`] === true) {
    toast('Already active', `${ITEM_META[itemKey].name} is already active on ${team.name}.`, 'warn');
    return;
  }

  if (ITEM_META[itemKey].instant) {
    useInstantItem(team, itemKey);
    persistState();
    renderAll();
    return;
  }

  let targets = getEnemyTargets(team.id);
  if (itemKey === 'thief') {
      }
  if (!targets.length) {
    toast('No valid target', 'There is no enemy team available for this item.', 'warn');
    return;
  }

  const fromReward = state.active?.type === 'reward' && state.active.teamId === team.id;
  state.active = {
    type: 'target',
    sourceTeamId: team.id,
    action: itemKey,
    fromReward,
    returnTo: fromReward ? JSON.parse(JSON.stringify(state.active)) : null,
    title: `Choose a target for ${ITEM_META[itemKey].name}`,
    description: ITEM_META[itemKey].desc,
    targetIds: targets.map((entry) => entry.id)
  };
  persistState();
  renderAll();
  playSfx('ui');
}


function useInstantItem(team, itemKey) {
  if (itemKey === 'medkit') {
    team.inventory.medkit -= 1;
    team.lastItemTurn = state.turnSerial;
    team.lastItemKey = ITEM_META.medkit.name;
    team.lastItemComboAllowed = false;
    const healed = changeHp(team, 50);
    updateRewardStageAfterItem(team.id, itemKey, false, `${team.name} used a Medkit and recovered ${healed} HP.`);
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Medkit used', `${team.name} recovered ${healed} HP.`, 'success');
    return;
  }

  if (itemKey === 'shield') {
    team.inventory.shield -= 1;
    team.lastItemTurn = state.turnSerial;
    team.lastItemKey = ITEM_META.shield.name;
    team.lastItemComboAllowed = true;
    team.statuses.shieldCharges = 2;
    team.statuses.shieldActive = true;
    team.statuses.shieldTurns = 2;
    updateRewardStageAfterItem(team.id, itemKey, true, `${team.name} activated Shield for 2 bullets except Mini-gun shots and it will last for 2 turns.`);
    playSfx('utility');
    toast('Shield ready', `${team.name} can block 2 bullets except Mini-gun shots for 2 turns.`, 'info');
    return;
  }

  if (itemKey === 'reflect') {
    team.inventory.reflect -= 1;
    team.lastItemTurn = state.turnSerial;
    team.lastItemKey = ITEM_META.reflect.name;
    team.lastItemComboAllowed = true;
    team.statuses.reflect = 1;
    team.statuses.reflectActive = true;
    updateRewardStageAfterItem(team.id, itemKey, true, `${team.name} activated Reflect.`);
    playSfx('utility');
    toast('Reflect ready', `${team.name} will reflect 70% of the next non-Mini-gun gun damage.`, 'info');
    return;
  }

  if (itemKey === 'berserk') {
    team.inventory.berserk -= 1;
    team.lastItemTurn = state.turnSerial;
    team.lastItemKey = ITEM_META.berserk.name;
    team.lastItemComboAllowed = true;
    team.statuses.berserk = 1;
    team.statuses.berserkActive = true;
    changeHp(team, -30);
    updateRewardStageAfterItem(team.id, itemKey, true, `${team.name} activated Berserk, lost 30 HP, and empowered the next attack.`);
    triggerArenaFlash('warn');
    playSfx('utility');
    toast('Berserk ready', `${team.name} lost 30 HP and the next attack is free with +25 total damage.`, 'warn');
    maybeOpenEndgame();
  }
}


function resolveTargetSelection(targetId) {
  if (state.active?.type !== 'target') return;
  const source = getTeamById(state.active.sourceTeamId);
  const target = getTeamById(targetId);
  if (!source || !target) return;

  if (state.active.action === 'flashbang') {
    source.inventory.flashbang -= 1;
    source.lastItemTurn = state.turnSerial;
    source.lastItemKey = ITEM_META.flashbang.name;
    source.lastItemComboAllowed = true;
    target.statuses.skipTurns += 1;
    const message = `${source.name} used Flashbang on ${target.name}. ${target.name} will lose its next turn.`;
    updateAfterTargetedItemUse(source.id, 'flashbang', true, message, 'warn');
    triggerArenaFlash('warn');
    playSfx('utility');
    toast('Flashbang landed', `${target.name} will be skipped on the next turn.`, 'warn');
    return;
  }

  if (state.active.action === 'c4') {
    source.inventory.c4 -= 1;
    source.lastItemTurn = state.turnSerial;
    source.lastItemKey = ITEM_META.c4.name;
    source.lastItemComboAllowed = false;
    target.traps.c4 = { ownerId: source.id, progress: 0 };
    const message = `${source.name} planted C4 on ${target.name}.`;
    updateAfterTargetedItemUse(source.id, 'c4', false, message, 'danger');
    triggerArenaFlash('danger');
    playSfx('trap');
    toast('C4 planted', `${target.name} now carries a bomb penalty.`, 'danger');
    return;
  }

  if (state.active.action === 'thief') {
    source.inventory.thief -= 1;
    source.lastItemTurn = state.turnSerial;
    source.lastItemKey = ITEM_META.thief.name;
    source.lastItemComboAllowed = false;
    const stolenMoney = Math.min(50, target.money);
    const stolenAmmo = Math.min(1, target.ammo);
    changeMoney(target, -stolenMoney);
    target.ammo -= stolenAmmo;
    changeMoney(source, stolenMoney);
    source.ammo += stolenAmmo;
    const message = `${source.name} stole $${stolenMoney} and ${stolenAmmo} ammo from ${target.name}.`;
    updateAfterTargetedItemUse(source.id, 'thief', false, message, 'success');
    triggerArenaFlash('success');
    playSfx('utility');
    toast('Thief Card used', `${source.name} stole resources from ${target.name}.`, 'success');
    return;
  }
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

  
function applyAttack(attacker, target, bulletCount, bonusDamage = 0) {
  const weapon = WEAPONS[attacker.weapon];
  const bullets = Math.max(0, Number(bulletCount) || 0);
  if (!target || bullets <= 0) {
    return { kind: 'warn', message: '', damage: 0, blockedShots: 0, reflected: 0 };
  }

  let actualDamage = 0;
  let blockedShots = 0;
  for (let shot = 0; shot < bullets; shot += 1) {
    if (target.statuses.shieldActive && target.statuses.shieldCharges > 0 && !weapon.pierceShield) {
      target.statuses.shieldCharges -= 1;
      blockedShots += 1;
      if (target.statuses.shieldCharges <= 0) {
        target.statuses.shieldCharges = 0;
        target.statuses.shieldActive = false;
        target.statuses.shieldTurns = 0;
      }
    } else {
      actualDamage += weapon.damage;
    }
  }

  if (bonusDamage > 0) {
    actualDamage += bonusDamage;
  }

  const damageMultiplier = getTeamDamageMultiplier(attacker);
  if (damageMultiplier > 1 && actualDamage > 0) {
    actualDamage = Math.max(1, Math.round(actualDamage * damageMultiplier));
  }

  changeHp(target, -actualDamage);

  let reflected = 0;
  if (target.statuses.reflectActive && actualDamage > 0 && !weapon.pierceShield) {
    reflected = Math.max(1, Math.floor(actualDamage * 0.7));
    target.statuses.reflect = 0;
    target.statuses.reflectActive = false;
    changeHp(attacker, -reflected);
  }

  const notes = [];
  if (blockedShots > 0) notes.push(`${target.name} blocked ${blockedShots} bullet${blockedShots > 1 ? 's' : ''}.`);
  if (bonusDamage > 0) notes.push(`Berserk added +${bonusDamage} total damage.`);
  if (damageMultiplier > 1 && actualDamage > 0) notes.push(`${attacker.name} used the x${damageMultiplier.toFixed(1)} underdog damage boost.`);
  if (reflected > 0) notes.push(`${target.name} reflected ${reflected} damage.`);
  if (target.hp <= 0) notes.push(`${target.name} was eliminated.`);
  if (attacker.hp <= 0) notes.push(`${attacker.name} was eliminated by reflected damage.`);

  return {
    kind: actualDamage > 0 ? 'danger' : 'warn',
    damage: actualDamage,
    blockedShots,
    reflected,
    message: `${attacker.name} hit ${target.name} for ${actualDamage} damage. ${notes.join(' ')}`.trim()
  };
}

function resetAttackPlan() {
  if (state.active?.type !== 'target' || state.active.action !== 'attack') return;
  Object.keys(state.active.allocations || {}).forEach((teamId) => {
    state.active.allocations[teamId] = 0;
  });
  persistState();
  renderStage();
  playSfx('ui');
}

function adjustAttackPlan(teamId, delta) {
  if (state.active?.type !== 'target' || state.active.action !== 'attack') return;
  if (!state.active.targetIds.includes(teamId)) return;
  const current = state.active.allocations?.[teamId] || 0;
  const maxShots = state.active.maxShots || 0;
  const used = Object.values(state.active.allocations || {}).reduce((sum, value) => sum + value, 0);
  let next = current + delta;
  next = Math.max(0, next);
  if (delta > 0 && used >= maxShots) return;
  if (delta > 0 && used - current + next > maxShots) {
    next = maxShots - (used - current);
  }
  if (next === current) return;
  state.active.allocations[teamId] = next;
  persistState();
  renderStage();
  playSfx('ui');
}

function createShotFx(sourceTeamId, targetTeamId, blocked = false) {
  const source = document.querySelector(`[data-team-card="${sourceTeamId}"]`);
  const target = document.querySelector(`[data-team-card="${targetTeamId}"]`);
  if (!source || !target) return;
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const sx = s.left + s.width / 2;
  const sy = s.top + s.height / 2;
  const tx = t.left + t.width / 2;
  const ty = t.top + t.height / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const beam = document.createElement('div');
  beam.className = `shot-beam ${blocked ? 'blocked' : 'hit'}`;
  beam.style.left = `${sx}px`;
  beam.style.top = `${sy}px`;
  beam.style.width = `${length}px`;
  beam.style.transform = `translateY(-50%) rotate(${angle}deg)`;
  document.body.appendChild(beam);

  const impact = document.createElement('div');
  impact.className = `impact-burst ${blocked ? 'blocked' : 'hit'}`;
  impact.style.left = `${tx}px`;
  impact.style.top = `${ty}px`;
  document.body.appendChild(impact);
  requestAnimationFrame(() => { beam.classList.add('show'); impact.classList.add('show'); });
  window.setTimeout(() => { beam.remove(); impact.remove(); }, 520);
}

function confirmAttackPlan() {
  if (state.active?.type !== 'target' || state.active.action !== 'attack') return;
  const attacker = getTeamById(state.active.sourceTeamId);
  if (!attacker) return;
  const plan = Object.entries(state.active.allocations || {}).filter(([, shots]) => shots > 0);
  if (!plan.length) {
    toast('No bullets allocated', 'Choose at least one bullet target before confirming.', 'warn');
    return;
  }

  const totalShots = plan.reduce((sum, [, shots]) => sum + shots, 0);
  const freeAttack = attacker.statuses.berserk > 0;
  if (!freeAttack && attacker.ammo < totalShots) {
    toast('Not enough ammo', `${attacker.name} only has ${attacker.ammo} ammo.`, 'warn');
    return;
  }
  if (!freeAttack) {
    attacker.ammo -= totalShots;
  } else {
    attacker.statuses.berserk = 0;
    attacker.statuses.berserkActive = false;
  }

  let remainingBonus = freeAttack ? 25 : 0;
  const fragments = [];
  let flashKind = 'warn';
  pulseTeamCard(attacker.id, 'pulse-success');
  plan.forEach(([teamId, shots]) => {
    const target = getTeamById(teamId);
    if (!target || target.hp <= 0) return;
    const appliedBonus = remainingBonus > 0 ? remainingBonus : 0;
    remainingBonus = 0;
    const result = applyAttack(attacker, target, shots, appliedBonus);
    if (result.message) {
      fragments.push(`${target.name}: ${result.damage} dmg from ${shots} bullet${shots > 1 ? 's' : ''}${result.blockedShots ? `, blocked ${result.blockedShots}` : ''}${result.reflected ? `, reflected ${result.reflected}` : ''}.`);
    }
    if (result.damage > 0) {
      flashKind = 'danger';
    }
    pulseTeamCard(target.id, result.damage > 0 ? 'pulse-danger' : 'pulse-warn');
    if (result.damage > 0) {
      playSfx('attack-hit');
    } else if (result.blockedShots > 0) {
      playSfx('attack-block');
    }
  });

  state.feed = `${attacker.name} attacked. ${fragments.join(' ')}`.trim();
  toast('Attack resolved', state.feed, flashKind === 'danger' ? 'danger' : 'warn');
  triggerArenaFlash(flashKind);
  state.active = null;
  finalizeTurn();
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
      if (team.traps.c4.progress >= 4) {
        team.traps.c4 = null;
        notes.push(`${team.name} defused the C4 after 4 correct answers in a row.`);
      } else {
        notes.push(`${team.name} is still trying to defuse the C4 (${team.traps.c4.progress}/4).`);
      }
    } else {
      const scale = [60, 120, 250, 250];
      const damage = scale[Math.min(team.traps.c4.progress, scale.length - 1)];
      changeHp(team, -damage);
      team.traps.c4 = null;
      notes.push(`${team.name}'s C4 exploded for ${damage} damage.`);
    }
  }

  return notes;
}

function finalizeTurn() {
    consumeTurnBoost(getCurrentTeam());
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
    state.turnSerial = (state.turnSerial || 1) + 1;
    const candidate = state.teams[state.currentTurnIndex];
    if (candidate.hp <= 0) continue;
    expireStartOfTurnEffects(candidate);
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
  const trigger = remainingTiles <= PHASE_TWO_TRIGGER || aliveTeams.some((team) => team.hp <= PHASE_TWO_HP_TRIGGER);
  if (!trigger) return;

  const ranked = [...state.teams].sort((a, b) => b.hp - a.hp);
  state.phase = 2;
  state.alliances = [
    { name: 'Alliance A', teamIds: [ranked[0].id, ranked[3].id] },
    { name: 'Alliance B', teamIds: [ranked[1].id, ranked[2].id] }
  ];
  assignPhaseTwoUnderdogBoost();
  triggerArenaFlash('info');
  playSfx('phase');
  state.alliances.forEach((alliance, idx) => alliance.teamIds.forEach((id) => pulseTeamCard(id, idx === 0 ? 'pulse-success' : 'pulse-warn')));
  const boostedTeams = state.teams.filter((team) => team.statuses.phaseBoostTurns > 0).map((team) => team.name).join(' + ');
  const pairings = state.alliances.map((alliance) => `${alliance.name}: ${alliance.teamIds.map((id) => getTeamById(id)?.name || '').join(' + ')}`).join(' • ');
  toast('Phase 2 activated', `${pairings}. ${boostedTeams ? `${boostedTeams} gain x1.2 damage for their next turn.` : ''}`.trim(), 'info', { bigCenter: true });
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
      if (!state.flags.victorySfxPlayed) {
        stopBackgroundMusic();
        playSfx('victory');
        state.flags.victorySfxPlayed = true;
      }
      return true;
    }

    const allianceStats = getAllianceStats();
    const aliveAlliances = allianceStats.filter((alliance) => alliance.alive);
    if (remainingTiles > 0 && aliveAlliances.length > 1) return false;
    state.flags.endgame = true;
    state.active = { type: 'endgame' };
    state.screen = 'game';
    if (!state.flags.victorySfxPlayed) {
      stopBackgroundMusic();
      playSfx('victory');
      state.flags.victorySfxPlayed = true;
    }
    return true;
  }

  function forceEndGame() {
    clearTimer();
    state.board.forEach((tile) => {
      if (!tile.used) tile.used = true;
    });
    state.active = null;
    state.feed = 'The host ended the match early.';
    maybeOpenEndgame();
    persistState();
    renderAll();
    toast('Match ended', 'The host ended the game early and opened the final results.', 'warn');
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
    syncBackgroundMusic();
    dom.phaseLabel.textContent = state.phase === 1 ? 'Phase 1 — Free-for-all' : 'Phase 2 — 2 vs 2';
    if (state.screen === 'game' && getCurrentTeam()) {
      dom.currentTurnLabel.textContent = getCurrentTeam().name;
    } else {
      dom.currentTurnLabel.textContent = 'Lobby';
    }
    dom.miniFeed.textContent = state.feed;
    dom.miniFeed.title = state.feed;
    dom.soundToggleBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
    dom.soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
    dom.soundToggleBtn.classList.toggle('muted', !soundEnabled);
  }



  function renderWeaponTag(weapon) {
    if (!weapon) return '';
    return `<span class="weapon-tag weapon-${weapon.key}">${escapeHtml(weapon.name)}</span>`;
  }

  function toast(title, message, kind, options = {}) {
    const node = document.createElement('div');
    const extraClass = options.bigCenter ? ' hero-toast' : '';
    node.className = `toast ${kind}${extraClass}`;
    node.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    dom.toastHost.appendChild(node);
    triggerArenaFlash(kind);
    setTimeout(() => node.remove(), options.bigCenter ? 2600 : 2200);
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
                <span class="score-points">🏆 ${team.score} pts</span>
                <span class="score-streak">🔥 ${team.streak} streak</span>
              </div>
            </div>
            <span class="score-pill">${alliance ? escapeHtml(alliance) : 'Solo'}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function forceEndGame() {
    if (state.screen !== 'game' || state.flags.endgame) return;
    state.board.forEach((tile) => { tile.used = true; });
    state.active = null;
    state.feed = 'The host ended the match early.';
    maybeOpenEndgame();
    persistState();
    renderAll();
    toast('Match ended', 'The host closed the match and opened the final results.', 'warn');
  }

  function renderAllianceBanner() {
    if (state.phase !== 2 || !state.alliances) {
      dom.allianceBanner.classList.add('hidden');
      dom.allianceBanner.innerHTML = '';
      return;
    }
    const html = state.alliances.map((alliance, index) => {
      const allianceClass = index === 0 ? 'alliance-a' : 'alliance-b';
      const names = alliance.teamIds.map((id) => `<span class="${allianceClass}-text">${escapeHtml(getTeamById(id)?.name || '')}</span>`).join('<span class="alliance-plus"> + </span>');
      const totalHp = alliance.teamIds.reduce((sum, id) => sum + (getTeamById(id)?.hp || 0), 0);
      return `<div class="alliance-badge ${allianceClass}"><strong>${escapeHtml(alliance.name)}</strong><span class="alliance-names">${names}</span><span class="alliance-hp">${totalHp} HP</span></div>`;
    }).join('');
    dom.allianceBanner.innerHTML = `<div class="alliance-banner-title compact"><span class="eyebrow">🤝 2 vs 2</span><strong>Alliance Mode</strong></div>${html}`;
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
    const canUseItems = canUseInventoryDuringTurn(team.id);
    const canOpenShopNow = canOpenTeamShop(team.id);
    const alliance = state.phase === 2 ? getAllianceByTeamId(team.id)?.name || 'Independent' : 'Solo';
    const statusList = [];
    if (team.statuses.skipTurns > 0) statusList.push(`<span class="status-pill alert">💥 Skip x${team.statuses.skipTurns}</span>`);
    if (team.statuses.shieldActive && team.statuses.shieldCharges > 0) statusList.push(`<span class="status-pill good">🛡️ Shield ${team.statuses.shieldCharges}/2 • ${team.statuses.shieldTurns || 0} turns</span>`);
    if (team.statuses.reflectActive) statusList.push('<span class="status-pill good">↩️ Reflect live</span>');
    if (team.statuses.berserkActive) statusList.push('<span class="status-pill alert">😡 Berserk live</span>');
    if (team.statuses.phaseBoostTurns > 0 && getTeamDamageMultiplier(team) > 1) statusList.push(`<span class="status-pill good">⚔️ x${getTeamDamageMultiplier(team).toFixed(1)} damage boost</span>`);
    if (team.traps.c4) statusList.push(`<span class="status-pill alert">💣 C4 ${team.traps.c4.progress}/4</span>`);
    if (team.lastItemTurn === state.turnSerial && currentTurn) statusList.push(`<span class="status-pill">1 item used</span>`);
    if (!statusList.length) statusList.push('<span class="status-pill">Ready</span>');

    const selectedItemKey = state.active?.type === 'target' && state.active.sourceTeamId === team.id ? state.active.action : null;
    const inventoryButtons = INVENTORY_ORDER.map((key) => {
      const meta = ITEM_META[key];
      const value = team.inventory[key];
      const activeStatus = (key === 'shield' && team.statuses.shieldActive) || (key === 'reflect' && team.statuses.reflectActive) || (key === 'berserk' && team.statuses.berserkActive);
      const disabled = !(canUseItems && value > 0 && team.lastItemTurn !== state.turnSerial) || team.hp <= 0;
      return `
        <button class="inventory-btn ${activeStatus ? 'buff-live' : ''} ${selectedItemKey === key ? 'selected' : ''}" data-use-item="${team.id}:${key}" ${disabled ? 'disabled' : ''} title="${escapeHtml(meta.name)} — ${escapeHtml(meta.desc)}">
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
              <div class="team-topline">${escapeHtml(alliance)} • ${renderWeaponTag(weapon)}</div>
            </div>
          </div>
          <div>
            ${currentTurn ? '<span class="turn-badge">Current Turn</span>' : ''}
            <div class="streak-badge">Streak ${team.streak}</div>
          </div>
        </div>

        <div class="hp-wrap">
          <div class="hp-row"><strong>${team.hp} HP</strong><span>${team.score} pts</span></div>
          <div class="hp-track"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
        </div>

        <div class="team-money-bar"><span>Cash</span><strong>$${team.money}</strong></div>

        <div class="team-mini-stats">
          <div class="mini-stat"><span>Ammo</span><strong>${team.ammo}</strong></div>
          <div class="mini-stat damage-stat"><span>Damage</span><strong>${weapon.damage}</strong>${team.statuses.phaseBoostTurns > 0 && getTeamDamageMultiplier(team) > 1 ? `<small class="mini-boost-note">${escapeHtml(team.name)} gets x${getTeamDamageMultiplier(team).toFixed(1)} damage this turn</small>` : ''}</div>
          <div class="mini-stat"><span>Correct</span><strong>${team.correctAnswers}</strong></div>
          <div class="mini-stat cash-card"><span>Score</span><strong>${team.score}</strong></div>
        </div>

        <div class="status-row">${statusList.join('')}</div>

        <div class="inventory-grid">${inventoryButtons}</div>

        <div class="card-actions">
          <span class="mini-note">${canUseItems ? '1 item per turn. Shield / Reflect / Flashbang / Berserk can still pair with Attack.' : team.hp > 0 ? 'Stats stay visible while the center stage is open.' : 'Eliminated'}</span>
          <button class="hud-btn" data-open-shop="${team.id}" ${canOpenShopNow ? '' : 'disabled'}>Shop</button>
        </div>
      </article>
    `;
  }



function renderBoard() {
  dom.boardGrid.innerHTML = state.board.map((tile) => {
    const isActive = state.active?.tileId === tile.id;
    const disabled = state.screen !== 'game' || tile.used || !!state.active || state.flags.endgame;
    if (tile.used) {
      return `<div class="tile-ghost" aria-hidden="true"></div>`;
    }
    return `
      <button class="tile-btn ${isActive ? 'active' : ''}" data-open-tile="${tile.id}" ${disabled ? 'disabled' : ''}>
        <span class="tile-index">${tile.id}</span>
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
  const turnOwner = getTeamById(active.turnOwnerId);
  const responder = active.responderId ? getTeamById(active.responderId) : null;
  const optionDisabled = !['main', 'steal'].includes(active.mode);
  const timer = getQuestionTimerMeta(active.mode);
  const isStealPick = active.mode === 'steal-pick';
  const isStealTurn = active.mode === 'steal';
  const title = isStealPick ? 'Choose the steal team' : `Question ${question.id}`;
  const eyebrow = isStealPick ? '⚡ Steal Opportunity' : `❓ Tile ${active.tileId}`;
  const statusLine = active.mode === 'main'
    ? `${turnOwner?.name || 'Current team'} is answering now.`
    : active.mode === 'steal'
      ? `${responder?.name || 'Selected team'} has 8 seconds to steal the point.`
      : `${turnOwner?.name || 'The main team'} missed. Pick one of the other teams to fight for the steal.`;

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

  const stealCards = state.teams
    .filter((team) => team.id !== active.turnOwnerId)
    .map((team) => {
      const available = active.stealPool.includes(team.id) && team.hp > 0 && team.statuses.skipTurns <= 0;
      const reason = available
        ? 'Grant 8s steal turn'
        : team.hp <= 0
          ? 'Eliminated'
          : team.statuses.skipTurns > 0
            ? 'Skipped by effect'
            : 'Already used';
      const alliance = state.phase === 2 ? getAllianceByTeamId(team.id)?.name || 'Independent' : 'Solo';
      return `
        <button class="steal-btn pro ${available ? 'live' : 'locked'}" data-steal-team="${team.id}" ${available ? '' : 'disabled'}>
          <div class="steal-pro-top">
            <div class="team-ident compact">
              <div class="team-icon mini">${team.icon}</div>
              <div>
                <strong>${escapeHtml(team.name)}</strong>
                <small>${escapeHtml(alliance)} • ${escapeHtml(WEAPONS[team.weapon].name)}</small>
              </div>
            </div>
            <span class="status-pill ${available ? 'good' : 'alert'}">${available ? 'Ready' : 'Locked'}</span>
          </div>
          <div class="steal-pro-stats">
            <span>HP ${team.hp}</span>
            <span>Ammo ${team.ammo}</span>
            <span>Cash $${team.money}</span>
            <span>Streak ${team.streak}</span>
          </div>
          <div class="steal-cta">${escapeHtml(reason)}</div>
        </button>
      `;
    }).join('');

  const pickPanel = isStealPick ? `
    <div class="steal-selector">
      <div class="steal-selector-head">
        <span class="eyebrow">⚔️ Response Window</span>
        <h3>Select which remaining team gets the steal attempt</h3>
        <p>Only one team can take the next 8-second answer window.</p>
      </div>
      <div class="steal-pro-grid">${stealCards}</div>
    </div>
  ` : '';

  const focusBanner = isStealPick
    ? `
      <div class="stage-note-banner warn">
        <strong>Main answer missed</strong>
        <span>Choose one of the three remaining teams to keep the tile alive.</span>
      </div>
    `
    : isStealTurn
      ? `
        <div class="stage-note-banner info">
          <strong>Steal is live</strong>
          <span>${escapeHtml(responder?.name || 'Selected team')} is the only team allowed to answer now.</span>
        </div>
      `
      : '';

  const responderPill = isStealPick
    ? `<span class="stage-pill">Main team: ${escapeHtml(turnOwner?.name || 'Unknown')}</span>`
    : `<span class="stage-pill">Responder: ${escapeHtml(responder?.name || turnOwner?.name || 'Unknown')}</span>`;

  return `
    <div class="stage-card question-stage ${isStealPick ? 'pick-mode' : ''}">
      <div class="stage-top">
        <div>
          <span class="eyebrow">${eyebrow}</span>
          <h2>${escapeHtml(title)}</h2>
          <div class="stage-meta">${escapeHtml(statusLine)}</div>
        </div>
        <div class="stage-pills">
          <span class="stage-pill">${escapeHtml(question.category)}</span>
          ${responderPill}
          <span class="stage-pill timer ${timer.isLow ? 'low' : ''}" data-timer-pill>${escapeHtml(timer.label)}: ${escapeHtml(timer.value)}</span>
        </div>
      </div>

      <div class="question-body ${isStealPick ? 'pick-mode' : ''}">
        <div class="question-box ${isStealPick ? 'compact' : ''}">
          <div class="timer-track">
            <div class="timer-fill ${timer.isLow ? 'low' : ''}" data-timer-bar style="width:${timer.percent}%"></div>
          </div>
          <p class="question-text">${escapeHtml(question.prompt)}</p>
        </div>

        ${focusBanner}

        ${isStealPick ? pickPanel : `<div class="option-grid">${optionsHtml}</div>`}

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
      <div class="crate-row mystery-crate-row">
        ${active.crateChoices.map((entry, index) => `
          <button class="crate-card mystery ${active.crateChosen ? 'opened' : ''}" data-crate-key="${entry.id}" ${active.crateChosen ? 'disabled' : ''}>
            <div class="gift-stack">🎁🎁🎁</div>
            <strong>Mystery Crate ${String.fromCharCode(65 + index)}</strong>
            <small>${active.crateChosen ? 'Reward already claimed' : 'Tap to reveal 1 hidden streak reward.'}</small>
          </button>
        `).join('')}
      </div>
    ` : '';
    const needsCrate = active.crateChoices && !active.crateChosen;
    const rewardBadges = [
      `<span class="stage-pill reward-big">+$${active.moneyAward}</span>`,
      `<span class="stage-pill reward-big">+${active.ammoAward} ammo</span>`,
      `<span class="stage-pill reward-big">+${active.scoreAward} score</span>`
    ].join('');

    return `
      <div class="stage-card reward-stage-pro">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🏆 Reward Menu</span>
            <h2>${escapeHtml(team.name)} answered correctly</h2>
            <div class="stage-meta">Open a streak crate first if it appears, then you can still Attack, stock ammo, heal, or shop.</div>
          </div>
          <div class="stage-pills reward-pills-large">${rewardBadges}</div>
        </div>

        <div class="reward-box">
          <div class="reward-notes">
            <span class="status-pill">HP ${team.hp}</span>
            <span class="status-pill">Ammo ${team.ammo}</span>
            <span class="status-pill">Cash $${team.money}</span>
            <span class="status-pill">${escapeHtml(WEAPONS[team.weapon].name)}</span>
            ${active.turnItemKey ? `<span class="status-pill ${active.attackBlockedByItem ? 'alert' : 'good'}">Item used: ${escapeHtml(active.turnItemKey)}</span>` : ''}
            ${active.notes.map((note) => `<span class="status-pill">${escapeHtml(note)}</span>`).join('')}
          </div>
        </div>

        ${crateRow}

        <div class="reward-actions">
          <button class="reward-btn primary" data-stage-action="reward-attack" ${needsCrate || active.attackBlockedByItem ? 'disabled' : ''}>
            <strong>Attack</strong>
            <small>${active.attackBlockedByItem ? 'This turn item does not combine with Attack.' : 'Shoot one or more enemy teams.'}</small>
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

  const tab = active.tab || 'weapons';
  const affordWeapon = WEAPONS.some((weapon, index) => index === team.weapon + 1 && team.money >= weapon.price);
  const affordItem = SHOP_ITEMS.some((item) => team.money >= item.price);

  const weaponHtml = WEAPONS.map((weapon, index) => {
    const owned = index <= team.weapon;
    const nextTier = index === team.weapon + 1;
    const canBuy = nextTier && team.money >= weapon.price;
    const stateText = owned
      ? (index === team.weapon ? 'Equipped' : 'Unlocked')
      : nextTier
        ? (canBuy ? 'Ready to upgrade' : `Need $${weapon.price - team.money} more`)
        : 'Locked';
    return `
      <div class="shop-entry compact ${owned ? 'owned' : canBuy ? 'available' : ''}">
        <div class="shop-entry-head">
          <strong>${escapeHtml(weapon.name)}</strong>
          <span class="status-pill">$${weapon.price}</span>
        </div>
        <div class="shop-entry-body">
          <small>${escapeHtml(weapon.desc)}</small>
          <div class="store-lines">
            <span class="status-pill">Damage ${weapon.damage}</span>
            <span class="status-pill">${escapeHtml(stateText)}</span>
          </div>
        </div>
        <div class="shop-entry-foot">
          <button class="shop-btn inline ${canBuy ? 'primary' : ''}" data-buy-item="weapon:${index}" ${canBuy ? '' : 'disabled'}>${owned ? 'Owned' : 'Upgrade'}</button>
        </div>
      </div>
    `;
  }).join('');

  const itemHtml = SHOP_ITEMS.map((item) => {
    const canBuy = team.money >= item.price;
    const stock = item.key === 'ammo' ? `${team.ammo} ammo now` : `x${team.inventory[item.key]} owned`;
    return `
      <div class="shop-entry compact kit ${canBuy ? 'available' : ''}">
        <div class="shop-entry-head item-head">
          <div class="shop-title-row">
            <strong>${item.icon} ${escapeHtml(item.name)}</strong>
            <span class="status-pill item-price">$${item.price}</span>
          </div>
        </div>
        <div class="shop-entry-body item-body">
          <small>${escapeHtml(item.desc)}</small>
          <div class="store-lines">
            <span class="status-pill">${item.type === 'instant' ? 'Instant' : 'Inventory'}</span>
            <span class="status-pill">${escapeHtml(stock)}</span>
          </div>
        </div>
        <div class="shop-entry-foot item-foot">
          <button class="shop-btn inline ${canBuy ? 'primary' : ''}" data-buy-item="item:${item.key}" ${canBuy ? '' : 'disabled'}>Buy</button>
        </div>
      </div>
    `;
  }).join('');

  const activeGridClass = tab === 'items' ? 'shop-grid compact items-grid' : 'shop-grid compact weapons-grid';
  const activeHtml = tab === 'items' ? itemHtml : weaponHtml;
  const hint = tab === 'items'
    ? (affordItem ? 'Pick any item and buy instantly.' : 'Not enough cash for items yet. Use Back to choose another reward.')
    : (affordWeapon ? 'Your next weapon tier is available now.' : 'Not enough cash for the next weapon tier. Use Back if you want another reward.');

  return `
    <div class="stage-card shop-stage">
      <div class="stage-top">
        <div>
          <span class="eyebrow">🛒 Shop</span>
          <h2>${escapeHtml(team.name)} Loadout Terminal</h2>
          <div class="stage-meta">Compact view: switch tabs instead of scrolling.</div>
        </div>
        <div class="stage-pills">
          <span class="stage-pill">Cash $${team.money}</span>
          <span class="stage-pill">Ammo ${team.ammo}</span>
          <span class="stage-pill weapon-stage-pill">${renderWeaponTag(WEAPONS[team.weapon])}</span>
        </div>
      </div>

      <div class="shop-tabs">
        <button class="shop-tab ${tab === 'weapons' ? 'active' : ''}" data-shop-tab="weapons">
          <strong>Weapon Upgrades</strong>
          <small>4 tiers</small>
        </button>
        <button class="shop-tab ${tab === 'items' ? 'active' : ''}" data-shop-tab="items">
          <strong>Utility Items</strong>
          <small>8 options</small>
        </button>
      </div>

      <div class="shop-stage-note ${tab === 'items' ? (affordItem ? 'good' : 'warn') : (affordWeapon ? 'good' : 'warn')}">${escapeHtml(hint)}</div>

      <div class="${activeGridClass}">${activeHtml}</div>

      <div class="inline-actions">
        <button class="hud-btn" data-stage-action="back-from-shop">Back</button>
        <button class="hud-btn primary" data-stage-action="close-shop">${active.fromReward ? 'End Turn' : 'Close Shop'}</button>
      </div>
    </div>
  `;
}


  
function renderTargetStage() {
  const active = state.active;
  const source = getTeamById(active.sourceTeamId);
  if (active.action === 'attack') {
    const totalAllocated = Object.values(active.allocations || {}).reduce((sum, value) => sum + value, 0);
    const remaining = Math.max(0, (active.maxShots || 0) - totalAllocated);
    return `
      <div class="stage-card attack-plan-stage">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🎯 Attack Planner</span>
            <h2>${escapeHtml(active.title)}</h2>
            <div class="stage-meta">${escapeHtml(active.description)}</div>
          </div>
          <div class="stage-pills">
            <span class="stage-pill reward-big">${escapeHtml(source?.name || 'Unknown')}</span>
            <span class="stage-pill reward-big">Shots ${totalAllocated}/${active.maxShots}</span>
            <span class="stage-pill reward-big">${active.freeAttack ? 'FREE ATTACK +25' : `Ammo left ${source?.ammo ?? 0}`}</span>
          </div>
        </div>

        <div class="target-grid attack-grid">
          ${active.targetIds.map((id) => {
            const team = getTeamById(id);
            if (!team) return '';
            const shots = active.allocations?.[id] || 0;
            return `
              <div class="target-btn attack-target-card">
                <strong>${escapeHtml(team.name)}</strong>
                <small>HP ${team.hp} • Ammo ${team.ammo} • Cash $${team.money}</small>
                <small>${renderWeaponTag(WEAPONS[team.weapon])}</small>
                <div class="shot-stepper">
                  <button class="stepper-btn" data-attack-adjust="${team.id}:-1" ${shots > 0 ? '' : 'disabled'}>−</button>
                  <div class="shot-value">${shots}</div>
                  <button class="stepper-btn" data-attack-adjust="${team.id}:1" ${remaining > 0 ? '' : 'disabled'}>+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="stage-note-banner info">
          <strong>${active.burst ? 'Burst weapon active' : 'Single-shot weapon active'}</strong>
          <span>${active.burst ? 'Split bullets across any enemy teams you want.' : 'Choose exactly 1 target for this shot.'}</span>
        </div>

        <div class="inline-actions">
          <button class="hud-btn" data-stage-action="cancel-target">Back</button>
          <button class="hud-btn" data-stage-action="clear-attack">Reset</button>
          <button class="hud-btn primary" data-stage-action="confirm-attack">Confirm Attack</button>
          <button class="hud-btn" disabled></button>
        </div>
      </div>
    `;
  }

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
              <small>${renderWeaponTag(WEAPONS[team.weapon])}</small>
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
      <div class="stage-card endgame-stage">
        <div class="stage-top">
          <div>
            <span class="eyebrow">🏆 Match Over</span>
            <h2>${tied ? 'Tie Game' : `${escapeHtml(winner.name)} wins`}</h2>
            <div class="stage-meta">${tied ? 'The top teams finished with the same HP and score. Use a tie-breaker question if you want.' : `${escapeHtml(winner.name)} survived with ${winner.hp} HP and ${winner.score} score.`}</div>
          </div>
        </div>

        <div class="target-grid ranking-grid">
          ${ranking.map((team, index) => `
            <div class="target-btn rank-card rank-${index + 1} legacy-rank-card">
              <div class="rank-icon">${['🏆','🥈','🥉','🎖️'][index] || '🎖️'}</div>
              <div class="rank-inline"><strong>Top ${index + 1}: ${escapeHtml(team.name)}</strong>${index === 0 ? '<span class="rank-prize-inline">Receive a prize from the Organizers.</span>' : index === 1 ? '<span class="rank-prize-inline">Nominate at least 2 members to sing karaoke.</span>' : ''}</div>
            </div>
          `).join('')}
        </div>

        <div class="inline-actions">
          <button class="hud-btn primary" data-stage-action="restart-match">New Match</button>
          <button class="hud-btn warn" data-stage-action="open-punishment-video">Punishment Video</button>
          <button class="hud-btn" data-stage-action="close-punishment-video" ${state.flags.showPunishmentVideo ? '' : 'disabled'}>Hide Video</button>
          <button class="hud-btn" disabled></button>
        </div>
        ${state.flags.showPunishmentVideo ? renderPunishmentVideo() : ''}
      </div>
    `;
  }

  const alliances = getAllianceStats().sort((a, b) => (b.totalHp - a.totalHp) || (b.totalScore - a.totalScore));
  const winner = alliances[0];
  const tied = alliances[1] && alliances[0].totalHp === alliances[1].totalHp && alliances[0].totalScore === alliances[1].totalScore;
  const placementIcons = ['🏆', '🥈', '🥉', '🎖️'];
  return `
    <div class="stage-card endgame-stage">
      <div class="stage-top">
        <div>
          <span class="eyebrow">🏆 Match Over</span>
          <h2>${tied ? 'Alliance Tie' : `${escapeHtml(winner.name)} wins`}</h2>
          <div class="stage-meta">${tied ? 'Both alliances finished dead even. Launch a tie-breaker if you want a final decider.' : `${escapeHtml(winner.name)} dominated the final showdown.`}</div>
        </div>
      </div>

      <div class="target-grid ranking-grid two-up">
        ${alliances.map((alliance, index) => `
          <div class="target-btn rank-card rank-${index + 1} legacy-rank-card">
            <div class="rank-icon">${placementIcons[index] || '🎖️'}</div>
            <div class="rank-inline"><strong>Top ${index + 1}: ${escapeHtml(alliance.name)}</strong> <span class="rank-members-inline">(${escapeHtml(alliance.members.map((team) => team.name).join(' + '))})</span> ${index === 0 ? '<span class="rank-prize-inline">Receive a prize from the Organizers.</span>' : index === 1 ? '<span class="rank-prize-inline">Nominate at least 2 members to sing karaoke.</span>' : ''}</div>
          </div>
        `).join('')}
      </div>

      <div class="inline-actions">
        <button class="hud-btn primary" data-stage-action="restart-match">New Match</button>
        <button class="hud-btn warn" data-stage-action="open-punishment-video">Punishment Video</button>
        <button class="hud-btn" data-stage-action="close-punishment-video" ${state.flags.showPunishmentVideo ? '' : 'disabled'}>Hide Video</button>
        <button class="hud-btn" disabled></button>
      </div>
      ${state.flags.showPunishmentVideo ? renderPunishmentVideo() : ''}
    </div>
  `;
}

function renderPunishmentVideo() {
  return `
    <div class="video-modal">
      <div class="video-modal-head">
        <strong>Hidden Punishment Video</strong>
        <button class="hud-btn" data-stage-action="close-punishment-video">Close</button>
      </div>
      <div class="video-frame-wrap">
        <iframe src="${PUNISHMENT_VIDEO_EMBED}" title="Punishment Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function renderScreens() {
    dom.setupScreen.classList.toggle('hidden', state.screen !== 'setup');
    dom.rulesScreen.classList.toggle('hidden', state.screen !== 'rules');
  }

  
function canInteractWithTeam(teamId) {
  return canUseInventoryDuringTurn(teamId);
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

  function assignPhaseTwoUnderdogBoost() {
    const allianceStats = getAllianceStats();
    state.teams.forEach((team) => {
      team.statuses.phaseBoostTurns = 0;
      team.statuses.phaseBoostMultiplier = 1;
    });
    if (allianceStats.length < 2) return;
    const [a, b] = allianceStats;
    if (a.totalHp === b.totalHp) return;
    const underdog = a.totalHp < b.totalHp ? a : b;
    underdog.members.forEach((team) => {
      team.statuses.phaseBoostTurns = 1;
      team.statuses.phaseBoostMultiplier = 1.2;
    });
  }

  function getTeamDamageMultiplier(team) {
    if (!team?.statuses) return 1;
    return team.statuses.phaseBoostTurns > 0 ? Number(team.statuses.phaseBoostMultiplier) || 1 : 1;
  }

  function consumeTurnBoost(team) {
    if (!team?.statuses || team.statuses.phaseBoostTurns <= 0) return;
    team.statuses.phaseBoostTurns = Math.max(0, team.statuses.phaseBoostTurns - 1);
    if (team.statuses.phaseBoostTurns <= 0) {
      team.statuses.phaseBoostMultiplier = 1;
    }
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
    } else {
      stopBackgroundMusic();
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
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 1.4;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function syncBackgroundMusic() {
    if (!soundEnabled || state.screen !== 'game' || document.hidden) {
      stopBackgroundMusic();
      return;
    }
    const ctx = bootstrapAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (!bgMusicTimer && soundEnabled && state.screen === 'game' && !document.hidden) {
          bgMusicSeed = 0;
          scheduleBackgroundBar();
        }
      }).catch(() => {});
      return;
    }
    if (bgMusicTimer) return;
    bgMusicSeed = 0;
    scheduleBackgroundBar();
  }

  function stopBackgroundMusic() {
    if (bgMusicTimer) {
      clearTimeout(bgMusicTimer);
      bgMusicTimer = null;
    }
  }

  function scheduleBackgroundBar() {
    const ctx = bootstrapAudio();
    if (!ctx || !soundEnabled || state.screen !== 'game' || document.hidden) {
      stopBackgroundMusic();
      return;
    }
    const isAllianceMode = state.phase === 2;
    const barStart = ctx.currentTime + 0.05;
    const pulseRoots = isAllianceMode ? [130.81, 146.83, 155.56, 174.61] : [174.61, 196.0, 220.0, 246.94];
    const topLine = isAllianceMode ? [392.0, 466.16, 523.25, 587.33] : [523.25, 587.33, 659.25, 698.46];
    const root = pulseRoots[bgMusicSeed % pulseRoots.length];
    const accent = topLine[bgMusicSeed % topLine.length];
    const baseGain = isAllianceMode ? 0.17 : 0.12;
    const bassGain = isAllianceMode ? 0.14 : 0.09;
    const leadGain = isAllianceMode ? 0.095 : 0.06;
    [0, 0.58, 1.16, 1.74].forEach((offset, idx) => {
      playTone(ctx, { frequency: root * (idx % 2 === 0 ? 1 : 1.125), duration: 0.52, gain: baseGain, delay: (barStart - ctx.currentTime) + offset, type: isAllianceMode ? 'sawtooth' : 'sine' });
      playTone(ctx, { frequency: root / 2, duration: 0.48, gain: bassGain, delay: (barStart - ctx.currentTime) + offset, type: isAllianceMode ? 'square' : 'triangle' });
      if (isAllianceMode) playTone(ctx, { frequency: root * 1.5, duration: 0.18, gain: 0.04, delay: (barStart - ctx.currentTime) + offset + 0.18, type: 'square' });
      if (isAllianceMode) {
        playNoise(ctx, { duration: 0.05, gain: 0.022, delay: (barStart - ctx.currentTime) + offset + 0.02 });
      }
    });
    [0.12, 0.41, 0.7, 0.99, 1.28, 1.57, 1.86, 2.1].forEach((offset, idx) => {
      playTone(ctx, { frequency: accent * (idx % 3 === 0 ? 1 : idx % 2 === 0 ? 0.75 : 1.5), duration: isAllianceMode ? 0.16 : 0.2, gain: leadGain, delay: (barStart - ctx.currentTime) + offset, type: isAllianceMode ? 'triangle' : 'sine' });
    });
    bgMusicSeed += 1;
    bgMusicTimer = setTimeout(() => {
      bgMusicTimer = null;
      scheduleBackgroundBar();
    }, 2320);
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
      playTone(ctx, { frequency: 523.25, duration: 0.08, gain: 0.055, type: 'triangle' });
      playTone(ctx, { frequency: 659.25, duration: 0.09, gain: 0.06, delay: 0.05, type: 'triangle' });
      playTone(ctx, { frequency: 783.99, duration: 0.11, gain: 0.065, delay: 0.11, type: 'triangle' });
      playTone(ctx, { frequency: 1046.5, duration: 0.14, gain: 0.045, delay: 0.18, type: 'sine' });
      return;
    }
    if (name === 'streak-crate') {
      playTone(ctx, { frequency: 523.25, duration: 0.08, gain: 0.028, type: 'triangle' });
      playTone(ctx, { frequency: 659.25, duration: 0.08, gain: 0.03, delay: 0.06, type: 'triangle' });
      playTone(ctx, { frequency: 783.99, duration: 0.1, gain: 0.034, delay: 0.12, type: 'triangle' });
      playTone(ctx, { frequency: 1046.5, duration: 0.16, gain: 0.038, delay: 0.2, type: 'sine' });
      return;
    }
    if (name === 'crate-open') {
      playTone(ctx, { frequency: 880, duration: 0.05, gain: 0.026, type: 'triangle' });
      playTone(ctx, { frequency: 1174.66, duration: 0.08, gain: 0.028, delay: 0.05, type: 'triangle' });
      return;
    }
    if (name === 'wrong') {
      playTone(ctx, { frequency: 330, duration: 0.07, gain: 0.055, type: 'square' });
      playTone(ctx, { frequency: 250, duration: 0.12, gain: 0.06, slideTo: 180, delay: 0.03, type: 'sawtooth' });
      playNoise(ctx, { duration: 0.05, gain: 0.02, delay: 0.04 });
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
      playTone(ctx, { frequency: 120, duration: 0.03, gain: 0.12, type: 'square' });
      playNoise(ctx, { duration: 0.09, gain: 0.14 });
      playTone(ctx, { frequency: 980, duration: 0.025, gain: 0.12, slideTo: 240, delay: 0.004, type: 'square' });
      playTone(ctx, { frequency: 160, duration: 0.16, gain: 0.08, type: 'sawtooth', delay: 0.012 });
      return;
    }
    if (name === 'attack-block') {
      playTone(ctx, { frequency: 1300, duration: 0.02, gain: 0.12, slideTo: 500, type: 'square' });
      playNoise(ctx, { duration: 0.05, gain: 0.065, delay: 0.003 });
      playTone(ctx, { frequency: 780, duration: 0.05, gain: 0.06, type: 'triangle', delay: 0.02 });
      playTone(ctx, { frequency: 390, duration: 0.08, gain: 0.05, type: 'square', delay: 0.05 });
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
      return;
    }
    if (name === 'victory') {
      stopBackgroundMusic();
      playTone(ctx, { frequency: 523.25, duration: 0.12, gain: 0.065, type: 'triangle' });
      playTone(ctx, { frequency: 659.25, duration: 0.14, gain: 0.07, delay: 0.11, type: 'triangle' });
      playTone(ctx, { frequency: 783.99, duration: 0.16, gain: 0.075, delay: 0.24, type: 'triangle' });
      playTone(ctx, { frequency: 1046.5, duration: 0.28, gain: 0.08, delay: 0.4, type: 'sine' });
      playTone(ctx, { frequency: 1318.51, duration: 0.34, gain: 0.075, delay: 0.54, type: 'sine' });
      playNoise(ctx, { duration: 0.16, gain: 0.018, delay: 0.42 });
      return;
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
    gainNode.connect(masterGain || ctx.destination);
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
    gainNode.connect(masterGain || ctx.destination);
    source.start(start);
    source.stop(start + duration);
  }

  
function canUseInventoryDuringTurn(teamId) {
  const team = getTeamById(teamId);
  if (!team || team.hp <= 0 || state.screen !== 'game' || state.flags.endgame) return false;
  if (getCurrentTeam()?.id !== teamId) return false;
  return !state.active || (state.active.type === 'reward' && state.active.teamId === teamId);
}

function canOpenTeamShop(teamId) {
  const team = getTeamById(teamId);
  if (!team || team.hp <= 0 || state.screen !== 'game' || state.flags.endgame) return false;
  return getCurrentTeam()?.id === teamId && !state.active;
}

function isBurstWeapon(weapon) {
  return ['mp40', 'ak47', 'awm'].includes(weapon?.key);
}

function getAttackCapacity(team) {
  const weapon = WEAPONS[team.weapon];
  const burst = isBurstWeapon(weapon);
  if (team.statuses.berserk > 0) {
    return burst ? Math.max(team.ammo, 1) : 1;
  }
  return burst ? team.ammo : Math.min(team.ammo, 1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleStreakLoot(count) {
  const weightedPool = [
    'reflect', 'reflect', 'reflect',
    'berserk', 'berserk', 'berserk',
    'c4', 'c4', 'c4',
    'thief', 'thief', 'thief',
    'shield', 'flashbang', 'medkit'
  ];
  const picks = [];
  const available = [...weightedPool];
  while (picks.length < count && available.length) {
    const index = Math.floor(Math.random() * available.length);
    const pick = available[index];
    picks.push(pick);
    for (let i = available.length - 1; i >= 0; i -= 1) {
      if (available[i] === pick) available.splice(i, 1);
    }
  }
  return picks;
}

function createMysteryCrates(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `crate-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    reward: rollMysteryReward()
  }));
}

function rollMysteryReward() {
  const roll = Math.random() * 100;
  if (roll < 38) {
    return { type: 'money', amount: getRandomInt(40, 60) };
  }
  if (roll < 56) {
    return { type: 'ammo', amount: getRandomInt(1, 2) };
  }
  if (roll < 66) {
    return { type: 'weapon-upgrade' };
  }
  if (roll < 84) {
    return { type: 'item-pack', count: 1 };
  }
  if (roll < 94) {
    return { type: 'item-pack', count: 2 };
  }
  return { type: 'heal', amount: getRandomInt(30, 50) };
}

function applyMysteryReward(team, reward) {
  if (reward.type === 'money') {
    changeMoney(team, reward.amount);
    return `${team.name} opened a mystery crate and won $${reward.amount}.`;
  }
  if (reward.type === 'ammo') {
    team.ammo += reward.amount;
    return `${team.name} opened a mystery crate and gained ${reward.amount} ammo.`;
  }
  if (reward.type === 'weapon-upgrade') {
    if (team.weapon < WEAPONS.length - 1) {
      team.weapon += 1;
      return `${team.name} opened a mystery crate and upgraded to ${WEAPONS[team.weapon].name}.`;
    }
    const fallback = 80;
    changeMoney(team, fallback);
    return `${team.name} was already maxed, so the upgrade crate converted into $${fallback}.`;
  }
  if (reward.type === 'item-pack') {
    const loot = sampleStreakLoot(reward.count);
    loot.forEach((key) => {
      team.inventory[key] += 1;
    });
    return `${team.name} opened a Sabotage Pack and gained ${loot.map((key) => ITEM_META[key].name).join(' + ')}.`;
  }
  if (reward.type === 'heal') {
    const healed = changeHp(team, reward.amount);
    return `${team.name} opened a mystery crate and recovered ${healed} HP.`;
  }
  return `${team.name} opened a mystery crate.`;
}

function getTurnItemLabel(team) {
  if (team.statuses.berserkActive) return 'Berserk';
  if (team.statuses.reflectActive) return 'Reflect';
  if (team.statuses.shieldActive) return 'Shield';
  return 'Utility used';
}

function updateRewardStageAfterItem(teamId, itemKey, comboWithAttack, message) {
  state.feed = message;
  if (state.active?.type === 'reward' && state.active.teamId === teamId) {
    state.active.turnItemKey = ITEM_META[itemKey].name;
    if (!comboWithAttack) {
      state.active.attackBlockedByItem = true;
    }
    state.active.notes = [message, ...(state.active.notes || [])].slice(0, 6);
  }
}

function updateAfterTargetedItemUse(teamId, itemKey, comboWithAttack, message) {
  const returnTo = state.active?.returnTo ? JSON.parse(JSON.stringify(state.active.returnTo)) : null;
  state.feed = message;
  if (returnTo && returnTo.type === 'reward' && returnTo.teamId === teamId) {
    returnTo.turnItemKey = ITEM_META[itemKey].name;
    if (!comboWithAttack) {
      returnTo.attackBlockedByItem = true;
    }
    returnTo.notes = [message, ...(returnTo.notes || [])].slice(0, 6);
    state.active = returnTo;
    persistState();
    renderAll();
    return;
  }
  state.active = null;
  persistState();
  renderAll();
}

function expireStartOfTurnEffects(team) {
  if (team.statuses.shieldActive || team.statuses.shieldCharges > 0 || team.statuses.shieldTurns > 0) {
    team.statuses.shieldTurns = Math.max(0, (team.statuses.shieldTurns || 0) - 1);
    if (team.statuses.shieldTurns <= 0 || team.statuses.shieldCharges <= 0) {
      team.statuses.shieldActive = false;
      team.statuses.shieldCharges = 0;
      team.statuses.shieldTurns = 0;
    }
  }
  if (team.statuses.reflectActive || team.statuses.reflect > 0) {
    team.statuses.reflectActive = false;
    team.statuses.reflect = 0;
  }
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
      if (!parsed || ![6, 7, 8].includes(parsed.version)) return false;
      state = parsed;
      clearTimer();
      if (!state.timer) state.timer = { seconds: 0, maxSeconds: 0, label: 'Ready', running: false };
      state.timer.running = false;
      state.timer.maxSeconds = state.timer.maxSeconds || state.timer.seconds || 0;
      
if (!state.flags) state.flags = { endgame: false, victorySfxPlayed: false };
if (typeof state.flags.victorySfxPlayed !== 'boolean') state.flags.victorySfxPlayed = false;
if (!state.turnSerial) state.turnSerial = 1;
state.teams.forEach((team) => {
  if (typeof team.lastItemTurn !== 'number') team.lastItemTurn = -1;
  if (typeof team.lastItemKey !== 'string' && team.lastItemKey !== null) team.lastItemKey = null;
  if (typeof team.lastItemComboAllowed !== 'boolean') team.lastItemComboAllowed = true;
  if (!team.statuses) team.statuses = {};
  if (typeof team.statuses.shieldCharges !== 'number') team.statuses.shieldCharges = team.statuses.shield || 0;
  if (typeof team.statuses.shieldActive !== 'boolean') team.statuses.shieldActive = team.statuses.shieldCharges > 0;
  if (typeof team.statuses.shieldTurns !== 'number') team.statuses.shieldTurns = team.statuses.shieldActive ? 1 : 0;
  if (!restored.flags) restored.flags = { endgame: false, victorySfxPlayed: false, showPunishmentVideo: false };
  if (typeof restored.flags.showPunishmentVideo !== 'boolean') restored.flags.showPunishmentVideo = false;
  if (typeof team.statuses.reflectActive !== 'boolean') team.statuses.reflectActive = !!team.statuses.reflect;
  if (typeof team.statuses.berserkActive !== 'boolean') team.statuses.berserkActive = !!team.statuses.berserk;
  if (typeof team.statuses.phaseBoostTurns !== 'number') team.statuses.phaseBoostTurns = 0;
  if (typeof team.statuses.phaseBoostMultiplier !== 'number') team.statuses.phaseBoostMultiplier = 1;
});
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
function openSecretVideo() {
  const existing = document.querySelector('.video-modal');
  if (existing) { existing.classList.add('show'); return; }
  const modal = document.createElement('div');
  modal.className = 'video-modal show';
  modal.innerHTML = `
    <div class="video-modal-backdrop" data-video-close></div>
    <div class="video-modal-card glass-heavy">
      <div class="video-modal-head">
        <div>
          <span class="eyebrow">🎬 Hidden Video</span>
          <h3>Victory bonus</h3>
        </div>
        <button class="hud-btn" data-video-close>Close</button>
      </div>
      <div class="video-wrap">
        <iframe src="https://www.youtube.com/embed/OerUZMrp2l0?autoplay=1&rel=0" title="Hidden video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>`;
  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-video-close]')) {
      modal.remove();
    }
  });
  document.body.appendChild(modal);
}
