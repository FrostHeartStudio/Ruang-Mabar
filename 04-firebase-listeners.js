// Ruang Mabar module: 04-firebase-listeners.js
// Keep this file loaded in the order declared in index.html.
        // LISTENERS FIREBASE
           membersRef.on('value', (snapshot) => {
            document.getElementById('loading-profil').style.display = 'none';
            if (!snapshot.exists()) {
                document.getElementById('empty-profil').style.display = 'block';
                globalMembersData = {};
                updateShopDiamondDisplay();
                refreshMarketplaceDiamond();
                filterAndRenderMembers();
                return;
            }

            document.getElementById('empty-profil').style.display = 'none';
            const previousMembersData = globalMembersData || {};
            const nextMembersData = snapshot.val() || {};
            if (activeLoggedInMemberKey && previousMembersData[activeLoggedInMemberKey] && nextMembersData[activeLoggedInMemberKey]) {
                const starMemberKey = activeLoggedInMemberKey;
                const oldStars = Number(previousMembersData[starMemberKey].bintang || 0);
                const newStars = Number(nextMembersData[starMemberKey].bintang || 0);
                const knownStars = lastKnownMemberStars[starMemberKey] === undefined ? oldStars : Number(lastKnownMemberStars[starMemberKey] || 0);
                if (newStars > knownStars && !wheelStarUpdatePending[starMemberKey]) recordQuestStars(newStars - knownStars);
                lastKnownMemberStars[starMemberKey] = newStars;
            }
            globalMembersData = nextMembersData;
            updateShopDiamondDisplay();

            Object.keys(globalMembersData).forEach(k => {
                cleanupExpiredItemsForMember(k, globalMembersData[k]);
                const m = globalMembersData[k];
                if (m.isVip && m.vipExpiresAt && Number(m.vipExpiresAt) <= Date.now()) {
                    globalMembersData[k].isVip = false;
                }
                syncMemberHighestStats(k, m);
            });
            if (document.getElementById('tab-leaderboard')?.classList.contains('active')) renderLeaderboard();

            const selectSelf = document.getElementById('selectMemberSelf');
            if (activeLoggedInMemberKey && globalMembersData[activeLoggedInMemberKey]) {
                selectSelf.value = globalMembersData[activeLoggedInMemberKey].nama || globalMembersData[activeLoggedInMemberKey].username || '';
            }

            filterAndRenderMembers();

            if (!cachedLeaderboardSnapshot || cachedLeaderboardSnapshot.weekKey !== getLeaderboardWeekKey()) ensureLeaderboardSnapshot();
            if (!leaderboardIntervalStarted) {
                leaderboardIntervalStarted = true;
                setInterval(() => {
                    const currentWeekKey = getLeaderboardWeekKey();
                    if (!cachedLeaderboardSnapshot || cachedLeaderboardSnapshot.weekKey !== currentWeekKey) {
                        leaderboardSnapshotLoadPromise = null;
                        ensureLeaderboardSnapshot(true);
                    }
                    if (document.getElementById('tab-leaderboard')?.classList.contains('active')) renderLeaderboard();
                }, 60000);
            }

            const savedMemberKey = localStorage.getItem('ruangMabarLoggedInMemberKey');
            if (savedMemberKey && globalMembersData[savedMemberKey]) {
                activeLoggedInMemberKey = savedMemberKey;
                const savedMember = globalMembersData[savedMemberKey];
                const savedSelect = document.getElementById('selectMemberSelf');
                if (savedSelect) savedSelect.value = savedMember.nama || savedMember.username || '';
                document.getElementById('member-login-box').style.display = 'none';
                document.getElementById('member-edit-box').style.display = 'block';
                document.getElementById('member-personal-profile-preview').style.display = 'block';
                updateMemberPersonalView(savedMember);
                switchPersonalPanel('hiasan');
                updateShopDiamondDisplay();
                setMemberOnlineStatus(savedMemberKey, true);
                if (lastKnownMemberStars[savedMemberKey] === undefined) lastKnownMemberStars[savedMemberKey] = Number(savedMember.bintang || 0);
                if (!questTimeTicker) {
                    recordQuestLogin(savedMemberKey);
                    startQuestTimeTracking();
                }
            } else if (savedMemberKey) {
                localStorage.removeItem('ruangMabarLoggedInMemberKey');
                activeLoggedInMemberKey = null;
            } else if (activeLoggedInMemberKey && globalMembersData[activeLoggedInMemberKey]) {
                updateMemberPersonalView(globalMembersData[activeLoggedInMemberKey]);
            }

            if (isAdminLoggedIn) {
                populateAdminMemberList();
            }
            if (activeLoggedInMemberKey && globalMembersData[activeLoggedInMemberKey]) {
                const currentStars = Number(globalMembersData[activeLoggedInMemberKey].bintang || 0);
                if (lastKnownMemberStars[activeLoggedInMemberKey] === undefined) lastKnownMemberStars[activeLoggedInMemberKey] = currentStars;
                renderQuestUI();
            } else renderQuestUI();
        });

        shopRef.on('value', (snapshot) => {
            const loading = document.getElementById('loading-shop');
            const empty = document.getElementById('empty-shop');
            if (loading) loading.style.display = 'none';

            if (!snapshot.exists()) {
                if (empty) empty.style.display = 'block';
                globalShopData = {};
                renderShop();
                if (isAdminLoggedIn) populateAdminShopList();
                return;
            }
            if (empty) empty.style.display = 'none';
            globalShopData = snapshot.val();
            renderShop();
            if (isAdminLoggedIn) populateAdminShopList();
        });

        eventsRef.on('value', (snapshot) => {
            const container = document.getElementById('event-container');
            if (!container) return;

            if (!snapshot.exists()) {
                container.innerHTML = '<div class="empty-notice">Belum ada pengumuman. Nantikan kabar selanjutnya ya!</div>';
                globalEventsData = {};
                if (isAdminLoggedIn) populateAdminEventList();
                return;
            }

            globalEventsData = snapshot.val();
            container.innerHTML = '';

            const keys = Object.keys(globalEventsData).sort((a, b) => {
                const aTime = Number(globalEventsData[a].createdAt || 0);
                const bTime = Number(globalEventsData[b].createdAt || 0);
                return bTime - aTime;
            });
            if (keys.length === 0) {
                container.innerHTML = '<div class="empty-notice">Belum ada pengumuman. Nantikan kabar selanjutnya ya!</div>';
            } else {
                keys.forEach(key => {
                    const item = globalEventsData[key];
                    const card = document.createElement('div');
                    card.className = 'card-box';
                    card.style.cssText = 'border-color: #f59e0b; background: linear-gradient(135deg, #fffbeb, #fef3c7); margin-bottom: 12px;';
                    card.innerHTML = `
                        <h3 style="color: #d97706; margin-bottom: 8px;">📢 ${escapeHTML(item.judul || 'Pengumuman Ruang Mabar')}</h3>
                        <p style="font-size: 0.95rem; color: #1e293b; white-space: pre-line;">${escapeHTML(item.content || '')}</p>
                    `;
                    container.appendChild(card);
                });
            }

            if (isAdminLoggedIn) populateAdminEventList();
        });

        seasonEventRef.on('value', (snapshot) => {
            globalSeasonEventData = snapshot.exists() ? snapshot.val() : null;
            renderSeasonEvent();
        });

        chatsRef.on('value', (snapshot) => {
            const loading = document.getElementById('loading-chat');
            const empty = document.getElementById('empty-chat');
            if (loading) loading.style.display = 'none';

            if (!snapshot.exists()) {
                if (empty) empty.style.display = 'block';
                globalChatsData = {};
                renderChats();
                if (isAdminLoggedIn) populateAdminChatList();
                return;
            }
            if (empty) empty.style.display = 'none';
            globalChatsData = snapshot.val();
            renderChats();
            if (isAdminLoggedIn) populateAdminChatList();
        });

        arcadeRef.on('value', (snapshot) => {
            globalArcadeData = snapshot.exists() ? snapshot.val() : {};
            renderArcadeLinks();
            if (isAdminLoggedIn) populateAdminArcadeList();
        });

        marketplaceRef.on('value', (snapshot) => {
            globalMarketplaceData = snapshot.exists() ? snapshot.val() : {};
            renderMarketplace();
            refreshMarketplaceDiamond();
        });

        codesRef.on('value', (snapshot) => {
            globalCodesData = snapshot.exists() ? snapshot.val() : {};
            if (isAdminLoggedIn) populateAdminCodeList();
        });


        // Efek tambahan dibuat sebagai elemen terpisah supaya shiny dan partikel
        // tidak saling menimpa motif ::before/::after dari tiap hiasan.
        function applyNewProfileDecorationEffects(element, decorationId) {
            const effects = {
                sakura_bersemi: { particle: '#fbcfe8', glow: 'rgba(244,114,182,.85)', symbols: ['✿','✧','•'] },
                api_naga: { particle: '#fdba74', glow: 'rgba(249,115,22,.9)', symbols: ['•','✦','◆'] },
                petir_neon: { particle: '#a5f3fc', glow: 'rgba(34,211,238,.9)', symbols: ['ϟ','✦','•'] },
                emerald_venom: { particle: '#a7f3d0', glow: 'rgba(52,211,153,.9)', symbols: ['❖','✧','•'] },
                debu_kosmik: { particle: '#ddd6fe', glow: 'rgba(167,139,250,.95)', symbols: ['✦','✧','·'] }
            };
            const effect = effects[String(decorationId || '')] || (String(decorationId || '') === 'neon_matrix' ? { particle: '#ffffff', glow: 'rgba(255,255,255,.7)', symbols: [] } : null);
            const crackStyles = {
                phoenix_ember: { color2: 'rgba(249,115,22,.95)', lines: 'linear-gradient(132deg,transparent 0 18%,rgba(255,237,213,.98) 18.3%,transparent 18.8% 100%),linear-gradient(48deg,transparent 0 42%,rgba(249,115,22,.95) 42.3%,transparent 42.8% 100%),linear-gradient(164deg,transparent 0 67%,rgba(251,146,60,.95) 67.3%,transparent 67.8% 100%),linear-gradient(24deg,transparent 0 82%,rgba(254,215,170,.95) 82.3%,transparent 82.8% 100%)' },
                neon_matrix: { color2: 'rgba(34,197,94,.98)', lines: 'linear-gradient(132deg,transparent 0 18%,rgba(217,249,157,.98) 18.3%,transparent 18.8% 100%),linear-gradient(48deg,transparent 0 42%,rgba(34,197,94,.98) 42.3%,transparent 42.8% 100%),linear-gradient(164deg,transparent 0 67%,rgba(74,222,128,.95) 67.3%,transparent 67.8% 100%),linear-gradient(24deg,transparent 0 82%,rgba(190,242,100,.95) 82.3%,transparent 82.8% 100%)' },
                frost_relic: { color2: 'rgba(125,211,252,.98)', lines: 'linear-gradient(132deg,transparent 0 18%,rgba(255,255,255,.99) 18.3%,transparent 18.8% 100%),linear-gradient(48deg,transparent 0 42%,rgba(125,211,252,.98) 42.3%,transparent 42.8% 100%),linear-gradient(164deg,transparent 0 67%,rgba(224,242,254,.98) 67.3%,transparent 67.8% 100%),linear-gradient(24deg,transparent 0 82%,rgba(186,230,253,.98) 82.3%,transparent 82.8% 100%)' },
                desert_mirage: { color2: 'rgba(251,191,36,.98)', lines: 'linear-gradient(132deg,transparent 0 18%,rgba(255,247,174,.98) 18.3%,transparent 18.8% 100%),linear-gradient(48deg,transparent 0 42%,rgba(217,119,6,.98) 42.3%,transparent 42.8% 100%),linear-gradient(164deg,transparent 0 67%,rgba(254,243,199,.95) 67.3%,transparent 67.8% 100%),linear-gradient(24deg,transparent 0 82%,rgba(251,191,36,.98) 82.3%,transparent 82.8% 100%)' },
                deep_space: { color2: 'rgba(167,139,250,.98)', lines: 'linear-gradient(132deg,transparent 0 18%,rgba(233,213,255,.98) 18.3%,transparent 18.8% 100%),linear-gradient(48deg,transparent 0 42%,rgba(167,139,250,.98) 42.3%,transparent 42.8% 100%),linear-gradient(164deg,transparent 0 67%,rgba(103,232,249,.95) 67.3%,transparent 67.8% 100%),linear-gradient(24deg,transparent 0 82%,rgba(196,181,253,.98) 82.3%,transparent 82.8% 100%)' }
            };
            const crackStyle = crackStyles[String(decorationId || '')];
            if (!element || (!effect && !crackStyle) || element.querySelector('.rm-decoration-shine')) return;
            if (crackStyle) {
                const cracks = document.createElement('span');
                cracks.className = 'rm-profile-cracks';
                cracks.setAttribute('aria-hidden', 'true');
                const isFrostRelic = String(decorationId || '') === 'frost_relic';
                cracks.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;background-repeat:no-repeat;background-size:100% 100%;opacity:' + (isFrostRelic ? '.34' : '.78') + ';mix-blend-mode:screen;filter:drop-shadow(0 0 ' + (isFrostRelic ? '1px' : '3px') + ' ' + crackStyle.color2 + ');animation:' + (isFrostRelic ? 'rmFrostCrackShine' : 'rmProfileCrackShine') + ' 3.4s ease-in-out infinite;';
                cracks.style.backgroundImage = crackStyle.lines;
                element.appendChild(cracks);
            }
            if (!effect) return;
            const shine = document.createElement('span');
            shine.className = 'rm-decoration-shine';
            shine.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;';
            shine.setAttribute('aria-hidden', 'true');
            element.appendChild(shine);
            // Neon Matrix hanya menyalin sapuan Shiny putih diagonal Api Naga; tanpa partikel tambahan.
            if (String(decorationId || '') === 'neon_matrix') return;

            const particles = document.createElement('span');
            particles.className = 'rm-decoration-particles';
            particles.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;';
            particles.setAttribute('aria-hidden', 'true');
            particles.style.setProperty('--particle-color', effect.particle);
            particles.style.setProperty('--particle-glow', effect.glow);
            const positions = [
                [8,22],[18,68],[29,38],[39,82],[49,18],[58,57],[67,31],[76,74],
                [86,44],[94,20],[13,48],[34,61],[54,88],[72,15],[90,63],[24,12]
            ];
            positions.forEach((pos, index) => {
                const particle = document.createElement('span');
                particle.textContent = effect.symbols[index % effect.symbols.length];
                particle.style.left = pos[0] + '%';
                particle.style.top = pos[1] + '%';
                particle.style.width = (index % 4 === 0 ? '7px' : '4px');
                particle.style.height = 'auto';
                particle.style.background = 'transparent';
                particle.style.borderRadius = '0';
                particle.style.boxShadow = 'none';
                particle.style.color = effect.particle;
                particle.style.fontSize = (index % 4 === 0 ? '10px' : '7px');
                particle.style.textShadow = '0 0 6px ' + effect.glow;
                particle.style.setProperty('--particle-speed', (2.3 + (index % 5) * 0.45) + 's');
                particle.style.setProperty('--particle-delay', (-index * 0.31) + 's');
                particles.appendChild(particle);
            });
            element.appendChild(particles);
        }
