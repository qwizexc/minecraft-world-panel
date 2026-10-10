document.addEventListener('DOMContentLoaded', () => {

    let currentOnlinePlayers = [];
    let selectedTpTargetPlayer = '';
    let hellModeActive = false;

    const logToConsole = (text, type = 'info') => {
        const output = document.getElementById('console-output');
        if (!output) return;
        const div = document.createElement('div');
        div.className = type === 'error' ? 'text-rose-500 font-semibold' : (type === 'success' ? 'text-emerald-400 font-semibold' : (type === 'system' ? 'text-neutral-500 italic' : 'text-neutral-300'));
        div.textContent = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    };

    const runCommand = async (cmd) => {
        logToConsole(`> ${cmd}`, 'system');
        try {
            const response = await fetch('http://localhost:3000/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            });
            const data = await response.json();
            if (data.success) {
                logToConsole(`[Bot] Команда выполнена!`, 'success');
            } else {
                logToConsole(`[Ошибка] ${data.error}`, 'error');
            }
        } catch (err) {
            logToConsole(`[Ошибка сети] Запусти node server.js`, 'error');
        }
    };

    const switchTab = (tabName) => {
        ['console', 'world', 'players', 'generator'].forEach(t => {
            const el = document.getElementById(`tab-${t}`);
            const btn = document.getElementById(`btn-tab-${t}`);
            if (!el || !btn) return;

            if (t === tabName) {
                el.classList.remove('hidden');
                btn.className = "tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] font-bold tracking-tight uppercase transition bg-neutral-200 text-neutral-900 shadow cursor-pointer whitespace-nowrap flex items-center justify-center";
            } else {
                el.classList.add('hidden');
                btn.className = "tab-btn flex-1 py-2 px-1.5 rounded-xl text-[11px] font-bold tracking-tight uppercase transition text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 cursor-pointer whitespace-nowrap flex items-center justify-center";
            }
        });
    };

    document.getElementById('btn-tab-console')?.addEventListener('click', () => switchTab('console'));
    document.getElementById('btn-tab-world')?.addEventListener('click', () => switchTab('world'));
    document.getElementById('btn-tab-players')?.addEventListener('click', () => switchTab('players'));
    document.getElementById('btn-tab-generator')?.addEventListener('click', () => switchTab('generator'));

    // Консоль
    document.getElementById('command-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('command-input');
        if (!input || !input.value.trim()) return;
        let val = input.value.trim();
        if (!val.startsWith('/')) val = '/' + val;
        runCommand(val);
        input.value = '';
    });

    document.getElementById('btn-clear-console')?.addEventListener('click', () => {
        const output = document.getElementById('console-output');
        if (output) {
            output.innerHTML = '';
            logToConsole('[System] Консоль очищена.', 'system');
        }
    });

    document.querySelectorAll('.btn-quick').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) runCommand(cmd);
        });
    });

    document.querySelectorAll('.gamerule-checkbox').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const rule = e.target.getAttribute('data-rule');
            runCommand(`/gamerule ${rule} ${e.target.checked}`);
        });
    });

    const targetInput = document.getElementById('player-target-name');
    const actionsContainer = document.getElementById('player-actions-container');
    const selectedPlayerName = document.getElementById('selected-player-name');
    const selectedPlayerAvatar = document.getElementById('selected-player-avatar');

    const selectPlayer = (name) => {
        if (!name.trim()) {
            actionsContainer?.classList.add('hidden');
            return;
        }

        if (targetInput) targetInput.value = name;
        if (selectedPlayerName) selectedPlayerName.textContent = name;
        
        const cleanName = name.startsWith('@') ? 'steve' : name;
        if (selectedPlayerAvatar) {
            selectedPlayerAvatar.src = `https://minotar.net/helm/${cleanName}/24.png`;
        }

        actionsContainer?.classList.remove('hidden');
    };

    targetInput?.addEventListener('input', (e) => {
        selectPlayer(e.target.value);
    });

    const getTargetPlayer = () => {
        return (targetInput && targetInput.value.trim()) ? targetInput.value.trim() : '@p';
    };

    document.getElementById('btn-player-gm-survival')?.addEventListener('click', () => runCommand(`/gamemode survival ${getTargetPlayer()}`));
    document.getElementById('btn-player-gm-creative')?.addEventListener('click', () => runCommand(`/gamemode creative ${getTargetPlayer()}`));
    document.getElementById('btn-player-gm-spectator')?.addEventListener('click', () => runCommand(`/gamemode spectator ${getTargetPlayer()}`));
    document.getElementById('btn-player-kick')?.addEventListener('click', () => runCommand(`/kick ${getTargetPlayer()}`));
    document.getElementById('btn-player-ban')?.addEventListener('click', () => runCommand(`/ban ${getTargetPlayer()}`));

    document.getElementById('btn-player-kill')?.addEventListener('click', () => {
        runCommand(`/kill ${getTargetPlayer()}`);
    });

    document.getElementById('btn-player-dirt-inv')?.addEventListener('click', () => {
        const target = getTargetPlayer();
        runCommand(`/clear ${target}`);
        setTimeout(() => {
            for (let i = 0; i < 40; i++) {
                runCommand(`/give ${target} dirt 64`);
            }
        }, 300);
    });

    document.getElementById('btn-player-bad-effects')?.addEventListener('click', () => {
        const target = getTargetPlayer();
        runCommand(`/effect give ${target} minecraft:blindness 9999 1 true`);
        runCommand(`/effect give ${target} minecraft:slowness 9999 2 true`);
        runCommand(`/effect give ${target} minecraft:nausea 9999 1 true`);
    });

    document.getElementById('btn-player-tp-nether')?.addEventListener('click', () => {
        const target = getTargetPlayer();
        runCommand(`/execute in minecraft:the_nether run tp ${target} 0 70 0`);
    });

    document.getElementById('btn-player-all-in-one')?.addEventListener('click', () => {
        const target = getTargetPlayer();
        
        runCommand('/weather thunder');
        runCommand('/time set midnight');

        runCommand(`/effect give ${target} minecraft:blindness 9999 1 true`);
        runCommand(`/effect give ${target} minecraft:slowness 9999 2 true`);
        runCommand(`/effect give ${target} minecraft:nausea 9999 1 true`);

        runCommand(`/execute in minecraft:the_nether run tp ${target} 0 70 0`);

        runCommand(`/clear ${target}`);
        setTimeout(() => {
            for (let i = 0; i < 40; i++) {
                runCommand(`/give ${target} dirt 64`);
            }
        }, 300);
    });

    const tpSelectSelected = document.getElementById('tp-select-selected');
    const tpSelectItems = document.getElementById('tp-select-items');
    const tpSelectArrow = document.getElementById('tp-select-arrow');
    const tpCurrentText = document.getElementById('tp-select-current-text');

    if (tpSelectSelected && tpSelectItems) {
        tpSelectSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !tpSelectItems.classList.contains('hidden');
            tpSelectItems.classList.toggle('hidden', isOpen);
            tpSelectArrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    document.getElementById('btn-player-tp-exec')?.addEventListener('click', () => {
        const who = getTargetPlayer();
        const x = document.getElementById('tp-x')?.value.trim();
        const y = document.getElementById('tp-y')?.value.trim();
        const z = document.getElementById('tp-z')?.value.trim();

        if (x !== '' && y !== '' && z !== '') {
            runCommand(`/tp ${who} ${x} ${y} ${z}`);
        } else if (selectedTpTargetPlayer) {
            runCommand(`/tp ${who} ${selectedTpTargetPlayer}`);
        } else {
            logToConsole('[Ошибка] Выберите цель или координаты', 'error');
        }
    });

    const easterEggBtn = document.getElementById('easter-egg-btn');
    const normalHeaderTitle = document.getElementById('normal-header-title');
    const normalButtonsContainer = document.getElementById('normal-buttons-container');
    const hackButtonsContainer = document.getElementById('hack-buttons-container');
    const standardPanelBlock = document.getElementById('standard-panel-block');

    const toggleHackMode = () => {
        hellModeActive = !hellModeActive;

        const statusDot = document.getElementById('status-dot');
        const statusPing = document.getElementById('status-ping');
        const statusText = document.getElementById('status-text');

        document.body.classList.toggle('hack-mode', hellModeActive);

        if (hellModeActive) {
            document.body.style.backgroundColor = '#0d0202';
            if (statusDot) statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600";
            if (statusPing) statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75";
            if (statusText) {
                statusText.textContent = "ХАК-МОД АКТИВЕН";
                statusText.style.color = "#f87171";
            }

            normalHeaderTitle?.classList.add('hidden');
            easterEggBtn?.classList.remove('hidden');

            standardPanelBlock?.classList.add('hidden');
            normalButtonsContainer?.classList.add('hidden');
            hackButtonsContainer?.classList.remove('hidden');

            logToConsole('[WARN] ⚠️ Включен ХАК-МОД!', 'error');
        } else {
            document.body.style.backgroundColor = '#0a0a0a';
            if (statusDot) statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400";
            if (statusPing) statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
            if (statusText) {
                statusText.textContent = "Панель активна";
                statusText.style.color = "";
            }

            easterEggBtn?.classList.add('hidden');
            normalHeaderTitle?.classList.remove('hidden');

            standardPanelBlock?.classList.remove('hidden');
            normalButtonsContainer?.classList.remove('hidden');
            hackButtonsContainer?.classList.add('hidden');

            logToConsole('[System] Хак-мод отключен.', 'system');
        }
    };

    normalHeaderTitle?.addEventListener('click', toggleHackMode);
    easterEggBtn?.addEventListener('click', toggleHackMode);

    const fetchPlayers = async () => {
        const container = document.getElementById('players-list-container');
        const countBadge = document.getElementById('players-count');
        if (!container || !countBadge) return;

        try {
            const response = await fetch('http://localhost:3000/api/players');
            const data = await response.json();

            if (data.success && data.players && data.players.length > 0) {
                currentOnlinePlayers = data.players;
                countBadge.textContent = `${data.players.length} в сети`;
                container.innerHTML = '';

                if (tpSelectItems) {
                    tpSelectItems.innerHTML = '';
                    data.players.forEach(p => {
                        const opt = document.createElement('div');
                        opt.className = "px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg cursor-pointer transition";
                        opt.textContent = p;
                        opt.addEventListener('click', () => {
                            selectedTpTargetPlayer = p;
                            if (tpCurrentText) tpCurrentText.textContent = `К игроку: ${p}`;
                            tpSelectItems.classList.add('hidden');
                        });
                        tpSelectItems.appendChild(opt);
                    });
                }

                data.players.forEach(playerName => {
                    const playerCard = document.createElement('div');
                    playerCard.className = "flex items-center justify-between px-3 py-2 bg-[#121212] hover:bg-neutral-800/80 rounded-xl cursor-pointer transition border border-neutral-800/60 group";
                    const headUrl = `https://minotar.net/helm/${playerName}/20.png`;

                    playerCard.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <img src="${headUrl}" alt="${playerName}" class="w-5 h-5 rounded shadow-sm group-hover:scale-105 transition-transform" onerror="this.src='https://minotar.net/helm/steve/20.png'">
                            <span class="text-xs font-medium text-neutral-200">${playerName}</span>
                        </div>
                        <span class="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-semibold transition">Выбрать</span>
                    `;

                    playerCard.addEventListener('click', () => {
                        selectPlayer(playerName);
                    });

                    container.appendChild(playerCard);
                });
            } else {
                countBadge.textContent = "0 в сети";
                container.innerHTML = `<div class="text-neutral-500 text-xs italic px-3 py-2">Игроков в мире не найдено...</div>`;
            }
        } catch (err) {
            countBadge.textContent = "ошибка";
        }
    };

    setInterval(fetchPlayers, 3000);
    fetchPlayers();

    const selectSelected = document.getElementById('select-selected');
    const selectItems = document.getElementById('select-items');
    const selectArrow = document.getElementById('select-arrow');
    const currentText = document.getElementById('select-current-text');

    if (selectSelected && selectItems) {
        selectSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !selectItems.classList.contains('hidden');
            selectItems.classList.toggle('hidden', isOpen);
            selectArrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        document.querySelectorAll('.select-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.getAttribute('data-value');
                currentText.textContent = opt.textContent;
                selectItems.classList.add('hidden');
                runCommand(`/difficulty ${val}`);
            });
        });
    }

    const genSelectSelected = document.getElementById('gen-select-selected');
    const genSelectItems = document.getElementById('gen-select-items');
    const genCurrentText = document.getElementById('gen-select-current-text');
    const genTypeInput = document.getElementById('gen-type');

    if (genSelectSelected && genSelectItems) {
        genSelectSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !genSelectItems.classList.contains('hidden');
            genSelectItems.classList.toggle('hidden', isOpen);
        });

        document.querySelectorAll('.gen-select-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.getAttribute('data-value');
                genCurrentText.textContent = opt.textContent;
                genTypeInput.value = val;
                genSelectItems.classList.add('hidden');
                updatePreview();
            });
        });
    }

    document.addEventListener('click', () => {
        if (selectItems) selectItems.classList.add('hidden');
        if (genSelectItems) genSelectItems.classList.add('hidden');
        if (tpSelectItems) tpSelectItems.classList.add('hidden');
    });

    const updatePreview = () => {
        const type = genTypeInput ? genTypeInput.value : 'give';
        const target = document.getElementById('gen-target').value || '@p';
        const val = document.getElementById('gen-value').value || 'item';
        const preview = document.getElementById('gen-preview');
        if (!preview) return;

        let cmd = '';
        if (type === 'give') cmd = `/give ${target} ${val} 1`;
        else if (type === 'summon') cmd = `/summon ${val}`;
        else if (type === 'effect') cmd = `/effect give ${target} ${val} 30 1 true`;

        preview.textContent = cmd;
    };

    ['gen-target', 'gen-value'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updatePreview);
    });

    document.getElementById('btn-exec-gen')?.addEventListener('click', () => {
        const preview = document.getElementById('gen-preview');
        if (preview) runCommand(preview.textContent);
    });

});