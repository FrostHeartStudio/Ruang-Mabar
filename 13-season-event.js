// Ruang Mabar module: 13-season-event.js
// Keep this file loaded in the order declared in index.html.
        // HALLOWEEN PRIZE CONFIG — ubah nama, ID, harga, dan ikon hadiah di bagian ini.
        const seasonEventRewards = [
            { id: 'halloween_candy_hunter', name: 'Lencana Candy Hunter', type: 'lencana', itemType: 'Lencana', price: 100, icon: '🍬', description: 'Lencana pemburu Candy bertema Halloween.' },
            { id: 'halloween_pumpkin_name', name: 'Pumpkin Glow', type: 'hiasan_nama', itemType: 'Hiasan Nama', price: 500, icon: '🎃', description: 'Hiasan nama Halloween permanen.' },
            { id: 'halloween_candy_box', name: 'Candy Basket', type: 'kotak_nama', itemType: 'Kotak Nama', price: 500, icon: '🧺', description: 'Kotak nama keranjang Candy Halloween.' },
            { id: 'halloween_haunted_profile', name: 'Haunted Pumpkin', type: 'hiasan_profil', itemType: 'Hiasan Profil', price: 1000, icon: '👻', description: 'Hiasan profil Halloween permanen.' },
            { id: 'halloween_dark_detail', name: 'Midnight Haunt', type: 'hiasan_detail_profil', itemType: 'Hiasan Detail Profil', price: 1500, icon: '🌙', description: 'Hiasan detail profil Halloween permanen.' }
        ];

        function switchSeasonEventView(view) {
            const game = view === 'game';
            document.getElementById('season-event-game-view').style.display = game ? 'block' : 'none';
            document.getElementById('season-event-shop-view').style.display = game ? 'none' : 'block';
            document.getElementById('season-event-game-tab').classList.toggle('active', game);
            document.getElementById('season-event-shop-tab').classList.toggle('active', !game);
            if (!game) refreshSeasonEventCoins();
        }

        function renderSeasonEvent() {
            const empty = document.getElementById('season-event-empty');
            const ended = document.getElementById('season-event-ended');
            const main = document.getElementById('season-event-main');
            if (!empty || !ended || !main) return;
            if (seasonEventCountdownTimer) { clearInterval(seasonEventCountdownTimer); seasonEventCountdownTimer = null; }
            if (!globalSeasonEventData || !globalSeasonEventData.startAt || !globalSeasonEventData.endsAt) {
                empty.style.display = 'block'; ended.style.display = 'none'; main.style.display = 'none'; activeSeasonEventKey = null;
                empty.textContent = 'Belum ada event yang tersedia. Nantikan update selanjutnya ya!';
                return;
            }
            activeSeasonEventKey = globalSeasonEventData.id || 'season';
            const updateStatus = () => {
                const now = Date.now();
                const expired = now >= Number(globalSeasonEventData.endsAt);
                empty.style.display = 'none'; ended.style.display = expired ? 'block' : 'none'; main.style.display = expired ? 'none' : 'block';
                if (expired) { stopSeasonEventGame(false); return; }
                const remain = Math.max(0, Number(globalSeasonEventData.endsAt) - now);
                const d = Math.floor(remain / 86400000), h = Math.floor((remain % 86400000) / 3600000), m = Math.floor((remain % 3600000) / 60000);
                const title = document.getElementById('season-event-title');
                const countdown = document.getElementById('season-event-countdown');
                if (title) title.textContent = '🎉 ' + (globalSeasonEventData.title || 'Event Season');
                if (countdown) countdown.textContent = `Event berakhir dalam ${d} hari ${h} jam ${m} menit.`;
            };
            updateStatus();
            seasonEventCountdownTimer = setInterval(updateStatus, 30000);
            renderSeasonEventShop();
            refreshSeasonEventCoins();
        }

        function renderSeasonEventShop() {
            const list = document.getElementById('season-event-shop-items');
            if (!list) return;
            list.innerHTML = '';
            seasonEventRewards.forEach(reward => {
                const card = document.createElement('div');
                card.className = 'shop-item card-box';
                card.style.cssText = 'margin-bottom:12px;border:1px solid #ddd6fe;background:linear-gradient(135deg,#fff,#f5f3ff);';
                card.innerHTML = `<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:2rem;">${reward.icon}</div><div style="flex:1;min-width:0;"><h3 style="font-size:1rem;color:#312e81;margin:0 0 4px;">${escapeHTML(reward.name)}</h3><p style="font-size:.8rem;color:#64748b;margin:0 0 6px;">${escapeHTML(reward.description)}</p><strong style="color:#7c3aed;">🪙 ${reward.price.toLocaleString('id-ID')} Candy</strong></div></div><button type="button" class="btn-action" style="margin-top:12px;background:#7c3aed;width:100%;" onclick="redeemSeasonEventReward('${reward.id}')">Tukarkan</button>`;
                list.appendChild(card);
            });
        }

        async function refreshSeasonEventCoins() {
            const gameCoins = document.getElementById('season-game-coins');
            const shopCoins = document.getElementById('season-shop-coins');
            if (!activeLoggedInMemberKey || !activeSeasonEventKey) {
                if (gameCoins) gameCoins.textContent = 'Login dulu';
                if (shopCoins) shopCoins.textContent = 'Login dulu';
                return 0;
            }
            try {
                const snap = await seasonEventRef.child('coinBalances').child(activeLoggedInMemberKey).once('value');
                const amount = Number(snap.val() || 0);
                if (gameCoins) gameCoins.textContent = amount.toLocaleString('id-ID');
                if (shopCoins) shopCoins.textContent = amount.toLocaleString('id-ID');
                return amount;
            } catch (e) { console.error('Gagal memuat Candy Event:', e); return 0; }
        }

        function bindSeasonCandyControls() {
            if (seasonEventCandyPointerBound) return;
            const arena = document.getElementById('season-game-arena');
            const basket = document.getElementById('season-game-basket');
            if (!arena || !basket) return;
            const move = (event) => {
                const rect = arena.getBoundingClientRect();
                const x = Math.max(0, Math.min(rect.width - basket.offsetWidth, event.clientX - rect.left - basket.offsetWidth / 2));
                basket.style.left = x + 'px';
            };
            arena.addEventListener('pointermove', move);
            arena.addEventListener('pointerdown', (event) => { move(event); if (seasonEventGameRunning) event.preventDefault(); });
            seasonEventCandyPointerBound = true;
        }

        function spawnSeasonCandy() {
            const layer = document.getElementById('season-game-candy-layer');
            const arena = document.getElementById('season-game-arena');
            if (!layer || !arena) return;
            const el = document.createElement('div');
            const size = 25 + Math.random() * 9;
            el.textContent = ['🍬', '🍭', '🍫', '🍬'][Math.floor(Math.random() * 4)];
            el.style.cssText = `position:absolute;left:${Math.random() * Math.max(1, arena.clientWidth - size)}px;top:-36px;width:${size}px;height:${size}px;font-size:${size}px;line-height:${size}px;text-align:center;filter:drop-shadow(0 2px 3px #0008);pointer-events:none;`;
            layer.appendChild(el);
            seasonEventCandyItems.push({ el, x: parseFloat(el.style.left), y: -36, size, speed: 95 + Math.min(260, seasonEventGameScore * 1.8) + Math.random() * 35 });
        }

        function seasonCandyFrame(timestamp) {
            if (!seasonEventGameRunning) return;
            const arena = document.getElementById('season-game-arena');
            const basket = document.getElementById('season-game-basket');
            if (!arena || !basket) return;
            const delta = Math.min(0.04, (timestamp - (seasonEventCandyLastFrame || timestamp)) / 1000);
            seasonEventCandyLastFrame = timestamp;
            const elapsed = (Date.now() - seasonEventGameStartedAt) / 1000;
            const spawnEvery = Math.max(230, 850 - elapsed * 17);
            if (timestamp - seasonEventCandyLastSpawn >= spawnEvery) {
                spawnSeasonCandy();
                if (elapsed > 12 && Math.random() < Math.min(0.65, elapsed / 75)) spawnSeasonCandy();
                seasonEventCandyLastSpawn = timestamp;
            }
            const basketLeft = parseFloat(basket.style.left || '0');
            const basketTop = arena.clientHeight - basket.offsetHeight - 8;
            for (let i = seasonEventCandyItems.length - 1; i >= 0; i--) {
                const candy = seasonEventCandyItems[i];
                candy.speed = 95 + Math.min(300, elapsed * 5.2) + Math.random() * 0.8;
                candy.y += candy.speed * delta;
                candy.el.style.top = candy.y + 'px';
                const caught = candy.y + candy.size >= basketTop && candy.y <= basketTop + basket.offsetHeight && candy.x + candy.size >= basketLeft && candy.x <= basketLeft + basket.offsetWidth;
                if (caught) {
                    seasonEventGameScore++;
                    const score = document.getElementById('season-game-score');
                    if (score) score.textContent = String(seasonEventGameScore);
                    candy.el.remove(); seasonEventCandyItems.splice(i, 1); continue;
                }
                if (candy.y > arena.clientHeight) {
                    candy.el.remove(); seasonEventCandyItems.splice(i, 1);
                    seasonEventCandyMisses++;
                    const misses = document.getElementById('season-game-misses');
                    if (misses) misses.textContent = String(seasonEventCandyMisses);
                    if (seasonEventCandyMisses >= 8) { stopSeasonEventGame(true, '8 Candy terlewat!'); return; }
                }
            }
            seasonEventCandyFrame = requestAnimationFrame(seasonCandyFrame);
        }

        async function startSeasonEventGame() {
            if (!activeLoggedInMemberKey) { alert('Login member dulu di Personalisasi untuk bermain dan menyimpan Candy.'); switchTab('personal'); return; }
            if (!globalSeasonEventData || Date.now() < Number(globalSeasonEventData.startAt || 0) || Date.now() >= Number(globalSeasonEventData.endsAt)) { renderSeasonEvent(); return; }
            if (seasonEventGameRunning) return;
            const memberKey = activeLoggedInMemberKey;
            const ticketResult = await database.ref(`members/${memberKey}/playTickets`).transaction(current => {
                const count = Number(current || 0);
                if (count < 1) return;
                return count - 1;
            });
            if (!ticketResult.committed) { alert('Play Tiket belum cukup! Selesaikan Quest Khusus login harian atau dapatkan dari Lucky Royale.'); return; }
            if (globalMembersData[memberKey]) globalMembersData[memberKey].playTickets = Number(ticketResult.snapshot.val() || 0);
            updateMemberPersonalView(globalMembersData[memberKey] || {});
            seasonEventGameRunning = true; seasonEventGameScore = 0; seasonEventCandyMisses = 0;
            seasonEventCandyItems = []; seasonEventCandyLastSpawn = 0; seasonEventCandyLastFrame = 0; seasonEventGameStartedAt = Date.now();
            const score = document.getElementById('season-game-score');
            const misses = document.getElementById('season-game-misses');
            const overlay = document.getElementById('season-game-overlay');
            const layer = document.getElementById('season-game-candy-layer');
            const button = document.getElementById('season-game-start');
            const basket = document.getElementById('season-game-basket');
            if (score) score.textContent = '0'; if (misses) misses.textContent = '0';
            if (layer) layer.innerHTML = '';
            if (basket) basket.style.left = Math.max(0, (document.getElementById('season-game-arena').clientWidth - basket.offsetWidth) / 2) + 'px';
            if (overlay) overlay.style.display = 'none'; if (button) button.disabled = true;
            bindSeasonCandyControls();
            if (seasonEventGameTimer) clearInterval(seasonEventGameTimer);
            seasonEventGameTimer = null;
            seasonEventCandyFrame = requestAnimationFrame(seasonCandyFrame);
        }

        async function stopSeasonEventGame(saveScore, reason = 'Permainan selesai!') {
            if (seasonEventGameTimer) { clearInterval(seasonEventGameTimer); seasonEventGameTimer = null; }
            if (seasonEventCandyFrame) { cancelAnimationFrame(seasonEventCandyFrame); seasonEventCandyFrame = null; }
            const wasRunning = seasonEventGameRunning;
            seasonEventGameRunning = false;
            seasonEventCandyItems.forEach(item => item.el.remove()); seasonEventCandyItems = [];
            const overlay = document.getElementById('season-game-overlay');
            const button = document.getElementById('season-game-start');
            if (button) button.disabled = false;
            if (overlay) { overlay.style.display = 'flex'; overlay.textContent = saveScore ? `${reason} Kamu berhasil menangkap ${seasonEventGameScore} Candy.` : 'Event telah berakhir.'; }
            if (!saveScore || !wasRunning || !activeLoggedInMemberKey || !activeSeasonEventKey) return;
            if (!globalSeasonEventData || Date.now() >= Number(globalSeasonEventData.endsAt)) { renderSeasonEvent(); return; }
            const balanceRef = seasonEventRef.child('coinBalances').child(activeLoggedInMemberKey);
            try {
                await balanceRef.transaction(current => Number(current || 0) + seasonEventGameScore);
                await refreshSeasonEventCoins();
                alert(`Permainan selesai! ${seasonEventGameScore} Candy berhasil ditambahkan ke saldo kamu.`);
            } catch (e) { console.error('Gagal menyimpan Candy Event:', e); alert('Candy belum berhasil disimpan. Coba periksa koneksi lalu hubungi admin.'); }
        }

        async function redeemSeasonEventReward(rewardId) {
            if (!activeLoggedInMemberKey) { alert('Login member dulu di Personalisasi sebelum menukar hadiah.'); switchTab('personal'); return; }
            if (!globalSeasonEventData || Date.now() >= Number(globalSeasonEventData.endsAt)) { renderSeasonEvent(); alert('Event telah berakhir.'); return; }
            const reward = seasonEventRewards.find(item => item.id === rewardId);
            if (!reward) return;
            const member = globalMembersData[activeLoggedInMemberKey];
            if (!member) { alert('Data member belum siap. Coba lagi.'); return; }
            const field = reward.type === 'hiasan_nama' ? 'unlockedHiasan' : reward.type === 'hiasan_profil' ? 'unlockedHiasanProfil' : reward.type === 'hiasan_detail_profil' ? 'unlockedHiasanDetailProfil' : reward.type === 'kotak_nama' ? 'unlockedKotakNama' : 'unlockedBadges';
            const owned = getItemArray(member[field]);
            if (owned.includes(reward.id)) { alert('Kamu sudah memiliki item ini. Item event hanya bisa ditukarkan satu kali.'); return; }
            const balanceRef = seasonEventRef.child('coinBalances').child(activeLoggedInMemberKey);
            try {
                const snap = await balanceRef.once('value');
                const balance = Number(snap.val() || 0);
                if (balance < reward.price) { alert('Candy belum cukup!'); return; }
                const updates = {};
                if (reward.type === 'hiasan_nama' || reward.type === 'hiasan_profil') {
                    addItemToInventory(updates, activeLoggedInMemberKey, member, { itemId: reward.id, itemName: reward.name, itemType: reward.itemType, count: 1 });
                } else {
                    const items = getItemArray(member[field]);
                    if (!items.includes(reward.id)) items.push(reward.id);
                    updates[`members/${activeLoggedInMemberKey}/${field}`] = items;
                }
                updates[`members/${activeLoggedInMemberKey}/itemExpiries/${reward.id}`] = null;
                const balanceAfter = balance - reward.price;
                updates[`seasonEvent/coinBalances/${activeLoggedInMemberKey}`] = balanceAfter;
                await database.ref().update(updates);
                if (globalMembersData[activeLoggedInMemberKey]) {
                    globalMembersData[activeLoggedInMemberKey][field] = [...owned, reward.id];
                    globalMembersData[activeLoggedInMemberKey].itemExpiries = globalMembersData[activeLoggedInMemberKey].itemExpiries || {};
                    delete globalMembersData[activeLoggedInMemberKey].itemExpiries[reward.id];
                }
                await refreshSeasonEventCoins();
                alert(`Berhasil menukarkan ${reward.name} secara permanen!`);
            } catch (e) { console.error('Penukaran hadiah Event gagal:', e); alert('Penukaran gagal disimpan. Coba lagi.'); }
        }

        async function adminStartSeasonEvent() {
            if (!isAdminLoggedIn) { alert('Login admin terlebih dahulu.'); return; }
            const snap = await seasonEventRef.once('value');
            if (snap.exists()) { alert('Sistem event masih tersimpan. Hapus sistem event lama terlebih dahulu jika ingin memulai Halloween Event.'); return; }
            const startAt = Date.now();
            await seasonEventRef.set({ id: 'season_' + startAt, title: 'Halloween Event', startAt, endsAt: startAt + 14 * 24 * 60 * 60 * 1000, coinBalances: {} });
            alert('Halloween Event berhasil diaktifkan selama 14 hari!');
        }

        async function adminDeleteSeasonEvent() {
            if (!isAdminLoggedIn) { alert('Login admin terlebih dahulu.'); return; }
            if (!confirm('Hapus seluruh sistem Halloween Event beserta saldo Candy semua member?')) return;
            await seasonEventRef.remove();
            alert('Sistem Event Season telah dihapus.');
        }

        function populateAdminEventList() {
            const list = document.getElementById('admin-event-delete-list');
            if (!list) return;
            list.innerHTML = '';
            Object.keys(globalEventsData).forEach(key => {
                const item = globalEventsData[key];
                const row = document.createElement('div');
                row.className = 'admin-member-row';
                row.innerHTML = `<span><strong>${escapeHTML(item.judul)}</strong></span><button class="btn-del-mini" onclick="eventsRef.child('${key}').remove()">🗑️ Hapus</button>`;
                list.appendChild(row);
            });
        }

        function populateAdminCodeList() {
            const list = document.getElementById('admin-code-delete-list');
            if (!list) return;
            list.innerHTML = '';
            const keys = Object.keys(globalCodesData);
            if (!keys.length) {
                list.innerHTML = '<small style="color:#94a3b8;">Belum ada kode redeem aktif.</small>';
                return;
            }
            keys.forEach(code => {
                const data = globalCodesData[code] || {};
                const row = document.createElement('div');
                row.className = 'admin-member-row';
                const reward = data.type === 'gelar' ? (data.gelar || data.label || 'Gelar') : ((data.type === 'hiasan_nama' || data.type === 'hiasan_profil') ? (hiasanNamaMap[data.preset] || hiasanProfilMap[data.preset] || data.preset) : `${data.value || 0} ${data.type || 'reward'}`);
                const redeemModeText = (data.redeemMode || 'once') === 'unlimited' ? 'Tak Terbatas' : '1x Redeem';
                row.innerHTML = `<span><strong>${escapeHTML(code)}</strong><br><small style="color:#64748b;">🎁 ${escapeHTML(reward)} • 🔄 ${redeemModeText}</small></span><button class="btn-del-mini" onclick="adminDeleteRedeemCode('${encodeURIComponent(code)}')">🗑️ Hapus</button>`;
                list.appendChild(row);
            });
        }

        function adminDeleteRedeemCode(encodedCode) {
            const code = decodeURIComponent(encodedCode);
            if (!globalCodesData[code]) return;
            alert(`✅ Kode ${code} berhasil dihapus dari daftar redeem.`);
            codesRef.child(code).remove();
        }

        function populateAdminArcadeList() {
            const list = document.getElementById('admin-arcade-delete-list');
            if (!list) return;
            list.innerHTML = '';
            Object.keys(globalArcadeData).forEach(key => {
                const item = globalArcadeData[key];
                const row = document.createElement('div');
                row.className = 'admin-member-row';
                row.innerHTML = `<span><strong>${escapeHTML(item.judul)}</strong></span><button class="btn-del-mini" onclick="adminDeleteArcade('${key}')">🗑️ Hapus</button>`;
                list.appendChild(row);
            });
        }

        function populateAdminChatList() {
            const container = document.getElementById('admin-chat-delete-list');
            if (!container) return;
            container.innerHTML = '';

            const keys = Object.keys(globalChatsData);
            if (keys.length === 0) {
                container.innerHTML = '<small style="color:#94a3b8;">Belum ada pesan chat.</small>';
                return;
            }

            keys.forEach(key => {
                const c = globalChatsData[key];
                const row = document.createElement('div');
                row.className = 'admin-member-row';
                row.innerHTML = `
                    <span style="font-size:0.8rem;"><strong>${escapeHTML(c.sender)}:</strong> ${escapeHTML(c.text)}</span>
                    <button class="btn-del-mini" onclick="adminDeleteChat('${key}')">🗑️</button>
                `;
                container.appendChild(row);
            });
        }

        function adminClearAllChats() {
            if (confirm("Hapus SELURUH isi pesan chat?")) {
                alert("✅ Seluruh chat dibersihkan!");
                chatsRef.remove();
            }
        }

        function adminDeleteChat(key) {
            chatsRef.child(key).remove();
        }
