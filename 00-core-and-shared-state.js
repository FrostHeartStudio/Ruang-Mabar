// Ruang Mabar module: 00-core-and-shared-state.js
// Keep this file loaded in the order declared in index.html.

      const firebaseConfig = {
            apiKey: "AIzaSyAXQMFgzDyTPiZpcTQiCyDtSGJrmplm47A",
            authDomain: "server-fhs.firebaseapp.com",
            databaseURL: "https://server-fhs-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "server-fhs",
            storageBucket: "server-fhs.firebasestorage.app",
            messagingSenderId: "914463990421",
            appId: "1:914463990421:web:787bdf227136ffb7e1319c",
            measurementId: "G-LPETHGY0L3"
        };
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const database = firebase.database();
        const membersRef = database.ref('members');
        const shopRef = database.ref('shop');
        const eventsRef = database.ref('events');
        const seasonEventRef = database.ref('seasonEvent');
        const chatsRef = database.ref('chats');
        const marketplaceRef = database.ref('marketplace');
        const codesRef = database.ref('codes');
        const arcadeRef = database.ref('arcade');
        const bankLoanOffersRef = database.ref('loanBankOffers');
        const playerLoanOffersRef = database.ref('loanPlayerOffers');
        const playerLoanContractsRef = database.ref('loanPlayerContracts');
        const bankLoanContractsRef = database.ref('loanBankContracts');
        const leaderboardRootRef = database.ref('leaderboards');
        let activeLeaderboardCategory = 'diamond';
        let cachedLeaderboardSnapshot = null;
        let leaderboardSnapshotLoadPromise = null;
        let highestStatsSyncInProgress = new Set();
        let leaderboardIntervalStarted = false;
        let globalBankLoanContracts = {};
        let globalPlayerLoanContracts = {};
        let globalBankLoanOffers = {};
        let globalPlayerLoanOffers = {};

        let isAdminLoggedIn = false;
        let globalMembersData = {};
        let globalShopData = {};
        let globalEventsData = {};
        let globalSeasonEventData = null;
        let activeSeasonEventKey = null;
        let seasonEventGameTimer = null;
        let seasonEventCandyFrame = null;
        let seasonEventCandyItems = [];
        let seasonEventCandyLastSpawn = 0;
        let seasonEventCandyLastFrame = 0;
        let seasonEventCandyMisses = 0;
        let seasonEventCandyPointerBound = false;
        let seasonEventGameRunning = false;
        let seasonEventGameScore = 0;
        let seasonEventGameRemaining = 60;
        let seasonEventCountdownTimer = null;
        let globalChatsData = {};
        let globalMarketplaceData = {};
        let globalCodesData = {};
        let globalArcadeData = {};
        let activeLoggedInMemberKey = null;
        let presenceMemberKey = null;
        let lastKnownMemberStars = {};
        let questTimeTicker = null;

        function setMemberOnlineStatus(memberKey, isOnline) {
            if (!memberKey) return;
            const statusRef = database.ref(`members/${memberKey}/onlineStatus`);
            if (isOnline) {
                statusRef.onDisconnect().set(false);
                statusRef.set(true);
                presenceMemberKey = memberKey;
            } else {
                statusRef.onDisconnect().cancel();
                statusRef.set(false);
                if (presenceMemberKey === memberKey) presenceMemberKey = null;
            }
        }

        database.ref('.info/connected').on('value', snapshot => {
            if (snapshot.val() === true && activeLoggedInMemberKey) {
                setMemberOnlineStatus(activeLoggedInMemberKey, true);
            }
        });

        const hiasanNamaMap = {
            'keberuntungan': 'Keberuntungan',
            'terpilih': 'Terpilih',
            'spesial_ungu': 'Ungu Shiny',
            'limited_shiny': 'Limited Shiny',
            'vip_gold': 'Emas VIP (Shiny Gold)',
            'vip_plus_gold': 'Emas VIP Plus (Ultra Shiny Gold)',
            'rose_shiny': 'Mawar Pink Shiny',
            'cyan_shiny': 'Biru Cyan Shiny',
            'orange_shiny': 'Jingga Api Shiny',
            'silver_shiny': 'Perak Kristal Shiny',
            'rainbow_shiny': 'Pelangi Prisma Shiny',
            'amethyst_shiny': 'Amethyst Nebula',
            'lava_shiny': 'Lava Core',
            'mint_shiny': 'Mint Glacier',
            'sakura_shiny': 'Sakura Moon',
            'sunset_shiny': 'Senja Astral',
            'ocean_shiny': 'Ocean Abyss',
            'aurora_shiny': 'Aurora Borealis',
            'obsidian_shiny': 'Obsidian Flame',
            'golden_sky_shiny': 'Golden Sky',
            'void_shiny': 'Void Eclipse',
            'halloween_pumpkin_name': 'Pumpkin Glow'
        };

        const hiasanProfilMap = {
            'kuning_border_ijo': 'Hiasan Profil Kuning',
            'biru_bercahaya': 'Hiasan Profil Diamond',
            'hitam_ornamen': 'Hiasan Profil Hitam Ornamen',
            'hijau_ornamen': 'Hiasan Profil Hijau Ornamen',
            'vip_plus_gold': 'Hiasan Profil VIP Plus Gold Shiny',
            'crystal_ungu': 'Hiasan Profil Crystal Ungu',
            'aurora_cerah': 'Hiasan Profil Langit Malam',
            'sakura_bersemi': 'Hiasan Profil Sakura Bersemi',
            'api_naga': 'Hiasan Profil Api Naga',
            'petir_neon': 'Hiasan Profil Petir Neon',
            'emerald_venom': 'Hiasan Profil Racun Emerald',
            'debu_kosmik': 'Hiasan Profil Debu Kosmik',
            'phoenix_ember': 'Hiasan Profil Phoenix Ember',
            'neon_matrix': 'Hiasan Profil Neon Matrix',
            'frost_relic': 'Hiasan Profil Relik Es',
            'desert_mirage': 'Hiasan Profil Mirage Gurun',
            'deep_space': 'Hiasan Profil Deep Space',
            'halloween_haunted_profile': 'Haunted Pumpkin',
        };
        const hiasanDetailProfilMap = {
            'vip_plus_gold': 'Hiasan Detail Profil VIP Plus',
            'detail_aurora': 'Aurora Menari',
            'detail_circuit': 'Cyber Circuit',
            'detail_ocean': 'Gelombang Samudra',
            'detail_prism': 'Prisma Pelangi',
            'detail_galaxy': 'Galaksi Bintang',
            'detail_solar': 'Solar Flare',
            'detail_frost': 'Kristal Beku',
            'detail_emerald': 'Jantung Emerald',
            'detail_crimson': 'Nebula Crimson',
            'detail_celestial': 'Arus Celestial',
            'halloween_dark_detail': 'Midnight Haunt'
        };
        const hiasanNamaClassMap = {
            'rose_shiny':'name-rose-shiny','cyan_shiny':'name-cyan-shiny',
            'orange_shiny':'name-orange-shiny','silver_shiny':'name-silver-shiny',
            'rainbow_shiny':'name-rainbow-shiny',
            'amethyst_shiny':'name-amethyst-shiny','lava_shiny':'name-lava-shiny',
            'mint_shiny':'name-mint-shiny','sakura_shiny':'name-sakura-shiny',
            'sunset_shiny':'name-sunset-shiny','ocean_shiny':'name-ocean-shiny',
            'aurora_shiny':'name-aurora-shiny','obsidian_shiny':'name-obsidian-shiny',
            'golden_sky_shiny':'name-golden-sky-shiny','void_shiny':'name-void-shiny'
        };
        const hiasanDetailClassMap = {
            'vip_plus_gold':'profile-detail-vip-plus-card','detail_aurora':'profile-detail-aurora',
            'detail_circuit':'profile-detail-circuit','detail_ocean':'profile-detail-ocean',
            'detail_prism':'profile-detail-prism','detail_galaxy':'profile-detail-galaxy',
            'detail_solar':'profile-detail-solar','detail_frost':'profile-detail-frost',
            'detail_emerald':'profile-detail-emerald','detail_crimson':'profile-detail-crimson',
            'detail_celestial':'profile-detail-celestial'
        };

        // PEMETAAN EMOJI KHUSUS UNTUK MASA AKTIF ITEM
        function getItemDurationEmoji(itemId) {
            switch (itemId) {
                case 'vip_plus_gold':
                case 'VIP Plus':
                case 'VIP Plus Member':
                    return '👑';
                case 'vip_gold':
                case 'VIP':
                case 'VIP Member':
                    return '👑';
                case 'keberuntungan':
                    return '❤️';
                case 'terpilih':
                    return '⭐';
                case 'limited_shiny':
                    return '🍀';
                case 'spesial_ungu':
                    return '💜';
                case 'kuning_border_ijo':
                    return '🟡';
                case 'biru_bercahaya':
                    return '💎';
                case 'hitam_ornamen':
                    return '🖤';
                case 'hijau_ornamen':
                    return '💚';
                default:
                    return '✨';
            }
        }

        // PEMETAAN EFEK SHINY TERANG UNTUK TEKS MASA AKTIF
        function getItemDurationShinyClass(itemId) {
            switch (itemId) {
                case 'vip_plus_gold':
                case 'VIP Plus':
                case 'VIP Plus Member':
                    return 'duration-gold-shiny';
                case 'vip_gold':
                case 'VIP':
                case 'VIP Member':
                    return 'duration-gold-shiny';
                case 'limited_shiny':
                    return 'duration-green-shiny';
                case 'spesial_ungu':
                    return 'duration-purple-shiny';
                case 'keberuntungan':
                    return 'duration-red-shiny';
                case 'terpilih':
                case 'biru_bercahaya':
                    return 'duration-diamond-shiny';
                case 'kuning_border_ijo':
                    return 'duration-yellow-shiny';
                case 'rose_shiny':
                    return 'duration-rose-shiny';
                case 'cyan_shiny':
                    return 'duration-cyan-shiny';
                case 'orange_shiny':
                    return 'duration-orange-shiny';
                case 'silver_shiny':
                    return 'duration-silver-shiny';
                case 'rainbow_shiny':
                    return 'duration-rainbow-shiny';
                case 'amethyst_shiny': return 'duration-amethyst-shiny';
                case 'lava_shiny': return 'duration-lava-shiny';
                case 'mint_shiny': return 'duration-mint-shiny';
                case 'sakura_shiny': return 'duration-sakura-shiny';
                case 'sunset_shiny': return 'duration-sunset-shiny';
                case 'ocean_shiny': return 'duration-ocean-shiny';
                case 'aurora_shiny': return 'duration-aurora-shiny';
                case 'obsidian_shiny': return 'duration-obsidian-shiny';
                case 'golden_sky_shiny': return 'duration-golden-sky-shiny';
                case 'void_shiny': return 'duration-void-shiny';
                case 'phoenix_ember': return 'duration-phoenix-ember';
                case 'neon_matrix': return 'duration-neon-matrix';
                case 'frost_relic': return 'duration-frost-relic';
                case 'desert_mirage': return 'duration-desert-mirage';
                case 'deep_space': return 'duration-deep-space';
                case 'hitam_ornamen':
                    return 'duration-silver-shiny';
                case 'hijau_ornamen':
                    return 'duration-green-shiny';
                case 'kuning_border_ijo': return 'duration-yellow-shiny';
                case 'aurora_cerah': return 'duration-aurora-shiny';
                case 'crystal_ungu': return 'duration-purple-shiny';
                case 'sakura_bersemi': return 'duration-rose-shiny';
                case 'api_naga': return 'duration-orange-shiny';
                case 'petir_neon': return 'duration-cyan-shiny';
                case 'emerald_venom': return 'duration-green-shiny';
                case 'debu_kosmik': return 'duration-void-shiny';
                case 'detail_aurora':
                    return 'duration-detail-aurora';
                case 'detail_circuit':
                    return 'duration-detail-circuit';
                case 'detail_ocean':
                    return 'duration-detail-ocean';
                case 'detail_prism':
                    return 'duration-detail-prism';
                case 'detail_galaxy':
                    return 'duration-detail-galaxy';
                case 'detail_solar': return 'duration-detail-solar';
                case 'detail_frost': return 'duration-detail-frost';
                case 'detail_emerald': return 'duration-detail-emerald';
                case 'detail_crimson': return 'duration-detail-crimson';
                case 'detail_celestial': return 'duration-detail-celestial';
                default:
                    return 'duration-gold-shiny';
            }
        }

        // PERHITUNGAN PERSYARATAN RANK
        function getRankFromBintang(bintang, manualRank) {
            const b = Number(bintang || 0);
            if (b >= 500) return "Demon";
            if (b >= 250) return "Super star";
            if (b >= 150) return "Ancient";
            if (b >= 100) return "Immortal";
            if (b >= 50) return "Glory";
            if (b >= 25) return "Honor";
            if (b >= 15) return "Mythic";
            if (b >= 10) return "Legend";
            if (b >= 5) return "Epic";
            return manualRank || "Warrior";
        }

        window.addEventListener('load', () => {
            if (!history.state) {
                history.replaceState({ tab: 'profil', modal: null }, '');
            }
            updateShopPresetOptions();
        });

        window.addEventListener('popstate', (e) => {
            const openModals = document.querySelectorAll('.modal-overlay');
            let modalClosed = false;
            openModals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    modalClosed = true;
                }
            });

            if (modalClosed) return;

            if (e.state && e.state.tab) {
                switchTab(e.state.tab, false);
            } else {
                switchTab('profil', false);
            }
        });

        async function openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
            history.pushState({ modal: modalId, tab: getCurrentActiveTab() }, '');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function getCurrentActiveTab() {
            const activeTab = document.querySelector('.tab-content.active');
            return activeTab ? activeTab.id.replace('tab-', '') : 'profil';
        }

        function showResultPopup(message, forceTitle = '') {
            const overlay = document.getElementById('resultModalOverlay');
            const title = document.getElementById('resultModalTitle');
            const icon = document.getElementById('resultModalIcon');
            const msg = document.getElementById('resultModalMessage');
            if (!overlay || !title || !msg) return;

            const rawText = String(message || '');
            const text = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, m => m === 'ℹ️' ? m : '').replace(/\s{2,}/g, ' ').replace(/^[ \t]+|[ \t]+$/gm, '').replace(/\n[ \t]+/g, '\n').trim();
            const isLoginRequired = /login.*dulu|login.*terlebih dahulu|silakan login|harus login|masuk.*dulu|masuk.*terlebih dahulu/i.test(text);
            const isSinglePurchaseError = /sekali beli|hanya dapat dibeli 1x|dibeli 1x/i.test(text);
            const isMemberVerification = /member.*verifikasi|verifikasi.*member|member.*terverifikasi|verifikasi berhasil/i.test(text);
            const isMemberLoginSuccess = /selamat datang kembali/i.test(text);
            const isSuccess = /berhasil|tersimpan|diperbarui|ditambahkan|dibuat|dibeli|dipublikasikan|dihapus|dibersihkan|diklaim|dipasang|dikirim|terverifikasi/i.test(text);
            const isError = /salah|gagal|kesalahan|tidak cukup|tidak valid|tidak ditemukan|tidak dapat|tidak bisa|habis|wajib|minimal|terlebih dahulu|belum/i.test(text);
            if (isLoginRequired) {
                title.textContent = forceTitle || 'Pemberitahuan';
                icon.textContent = 'ℹ️';
            } else if (isSinglePurchaseError) {
                title.textContent = forceTitle || 'Pemberitahuan';
                icon.textContent = '❌';
            } else if (isMemberVerification || isMemberLoginSuccess) {
                title.textContent = forceTitle || 'Berhasil';
                icon.textContent = '✅';
            } else {
                title.textContent = forceTitle || (isSuccess && !isError ? 'Berhasil' : 'Pemberitahuan');
                icon.textContent = isSuccess && !isError ? '✅' : '❌';
            }
            msg.textContent = text;
            overlay.classList.remove('show');
            void overlay.offsetWidth;
            overlay.classList.add('show');
        }

        function closeResultPopup() {
            const overlay = document.getElementById('resultModalOverlay');
            if (overlay) overlay.classList.remove('show');
        }

        window.alert = function(message) {
            showResultPopup(message);
        };

        function escapeHTML(str) {
            return String(str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function getItemArray(data) {
            if (!data) return [];
            return Array.isArray(data) ? [...data] : Object.values(data);
        }

        function getItemCounts(arr) {
            const counts = {};
            arr.forEach(id => {
                if (id) counts[id] = (counts[id] || 0) + 1;
            });
            return counts;
        }

        function togglePassword(inputId, btn) {
            const input = document.getElementById(inputId);
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            if (isPassword) {
                btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24M1 1l22 22"/></svg>`;
            } else {
                btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
            }
        }

        function getLeaderboardWeekKey(date = new Date()) {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const daysSinceMonday = (d.getDay() + 6) % 7;
            d.setDate(d.getDate() - daysSinceMonday);
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        }

        function getLeaderboardWeekLabel(weekKey) {
            const parts = String(weekKey || '').split('-').map(Number);
            if (parts.length !== 3 || !parts.every(Number.isFinite)) return 'Periode mingguan';
            const start = new Date(parts[0], parts[1]-1, parts[2]);
            const end = new Date(start); end.setDate(end.getDate()+6);
            const fmt = d => d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
            return `${fmt(start)} – ${fmt(end)}`;
        }

        function leaderboardValue(member, category) {
            if (category === 'diamond') return Number(member.diamond || 0);
            if (category === 'star') return Number(member.bintang || 0);
            return Number(member.level || 1);
        }

        function makeLeaderboardCategory(category, members) {
            return Object.entries(members || {}).map(([memberKey, member]) => ({
                memberKey,
                name: String(member.nama || member.username || memberKey),
                value: leaderboardValue(member || {}, category)
            })).sort((a,b) => b.value-a.value || a.name.localeCompare(b.name,'id')).map((entry,index) => ({...entry, rank:index+1}));
        }

        async function ensureLeaderboardSnapshot(forceRender = false) {
            if (leaderboardSnapshotLoadPromise) return leaderboardSnapshotLoadPromise;
            const weekKey = getLeaderboardWeekKey();
            leaderboardSnapshotLoadPromise = (async () => {
                const weekRef = leaderboardRootRef.child(`weeks/${weekKey}`);
                let snap = await weekRef.once('value');
                if (!snap.exists()) {
                    const membersSnap = await membersRef.once('value');
                    const members = membersSnap.val() || {};
                    const snapshotData = {
                        weekKey,
                        capturedAt: Date.now(),
                        categories: {
                            diamond: makeLeaderboardCategory('diamond', members),
                            star: makeLeaderboardCategory('star', members),
                            level: makeLeaderboardCategory('level', members)
                        }
                    };
                    // Snapshot disimpan sekali per minggu dan tidak berubah setelah dibuat.
                    await weekRef.transaction(current => current || snapshotData);
                    snap = await weekRef.once('value');
                }
                cachedLeaderboardSnapshot = snap.val() || null;
                const weekLabel = document.getElementById('leaderboard-week-label');
                if (weekLabel) weekLabel.textContent = `Periode: ${getLeaderboardWeekLabel(weekKey)}`;
                renderLeaderboard();
                return cachedLeaderboardSnapshot;
            })().catch(error => {
                console.error('Gagal memuat papan peringkat:', error);
                const status = document.getElementById('leaderboard-status');
                if (status) { status.style.display = 'block'; status.textContent = 'Papan peringkat gagal dimuat. Periksa koneksi lalu coba lagi.'; }
                return null;
            }).finally(() => { leaderboardSnapshotLoadPromise = null; });
            return leaderboardSnapshotLoadPromise;
        }

        function selectLeaderboardCategory(category) {
            if (!['diamond','star','level'].includes(category)) return;
            activeLeaderboardCategory = category;
            document.querySelectorAll('.leaderboard-category-btn').forEach(button => button.classList.toggle('active', button.dataset.leaderboardCategory === category));
            renderLeaderboard();
        }

        function leaderboardRewardForRank(rank) {
            if (rank === 1) return 300;
            if (rank >= 2 && rank <= 5) return 200;
            if (rank >= 6 && rank <= 100) return 100;
            return 0;
        }

        function renderLeaderboard() {
            const status = document.getElementById('leaderboard-status');
            const list = document.getElementById('leaderboard-list');
            const claimPanel = document.getElementById('leaderboard-claim-panel');
            if (!status || !list || !claimPanel) return;
            const weekKey = cachedLeaderboardSnapshot && cachedLeaderboardSnapshot.weekKey || getLeaderboardWeekKey();
            const entries = makeLeaderboardCategory(activeLeaderboardCategory, globalMembersData || {});
            const selfKey = activeLoggedInMemberKey;
            const ownEntry = selfKey ? entries.find(entry => entry.memberKey === selfKey) : null;
            const reward = ownEntry ? leaderboardRewardForRank(Number(ownEntry.rank)) : 0;
            const today = new Date();
            const isSunday = today.getDay() === 0;
            const claimed = !!(selfKey && globalMembersData[selfKey] && globalMembersData[selfKey].leaderboardRewardClaims && globalMembersData[selfKey].leaderboardRewardClaims[weekKey] && globalMembersData[selfKey].leaderboardRewardClaims[weekKey][activeLeaderboardCategory]);
            let claimText = '';
            if (!selfKey) claimText = 'Login melalui Personalisasi untuk melihat posisi akunmu dan mengklaim hadiah.';
            else if (!ownEntry || reward <= 0) claimText = 'Akun kamu belum masuk 100 besar pada kategori ini, jadi tidak ada hadiah untuk diklaim.';
            else if (claimed) claimText = `Peringkat kamu #${ownEntry.rank}. Hadiah ${reward} 💎 sudah diklaim untuk kategori ini minggu ini.`;
            else if (!isSunday) claimText = `Peringkat kamu #${ownEntry.rank}. Hadiah ${reward} 💎 bisa diklaim hari Minggu pukul 00.00–23.59.`;
            else claimText = `Peringkat kamu #${ownEntry.rank}! Kamu berhak klaim ${reward} 💎 untuk kategori ${activeLeaderboardCategory === 'star' ? 'Star' : activeLeaderboardCategory === 'diamond' ? 'Diamond' : 'Level'}.`;
            claimPanel.innerHTML = `<div>${escapeHTML(claimText)}</div>${selfKey && ownEntry && reward > 0 && !claimed && isSunday ? `<button class="btn-action" onclick="claimLeaderboardReward('${activeLeaderboardCategory}')">🎁 Klaim ${reward} Diamond</button>` : ''}`;
            if (!entries.length) {
                status.style.display = 'block'; status.textContent = 'Belum ada data untuk papan peringkat.'; list.innerHTML = ''; return;
            }
            status.style.display = 'none';
            const symbol = activeLeaderboardCategory === 'diamond' ? '💎' : activeLeaderboardCategory === 'star' ? '⭐' : '📊';
            list.innerHTML = entries.slice(0,100).map(entry => {
                const self = entry.memberKey === selfKey;
                const prize = leaderboardRewardForRank(Number(entry.rank));
                const rankMark = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
                return `<div class="leaderboard-row${self ? ' is-self' : ''}"><div class="leaderboard-rank-number${entry.rank===1?' top-one':''}">${rankMark}</div><div><div class="leaderboard-player-name">${escapeHTML(entry.name)}${self ? ' (Kamu)' : ''}</div><div class="leaderboard-player-sub">${prize ? `Hadiah: ${prize} 💎` : 'Belum masuk peringkat hadiah'}</div></div><div class="leaderboard-player-value">${symbol} ${Number(entry.value || 0).toLocaleString('id-ID')}</div></div>`;
            }).join('');
        }

        async function claimLeaderboardReward(category) {
            const key = activeLoggedInMemberKey;
            if (!key) return showResultPopup('Login dulu untuk klaim hadiah papan peringkat.');
            if (new Date().getDay() !== 0) return showResultPopup('Hadiah hanya bisa diklaim hari Minggu pukul 00.00–23.59.');
            await ensureLeaderboardSnapshot();
            const weekKey = cachedLeaderboardSnapshot && cachedLeaderboardSnapshot.weekKey || getLeaderboardWeekKey();
            const entries = cachedLeaderboardSnapshot && cachedLeaderboardSnapshot.categories && cachedLeaderboardSnapshot.categories[category] || [];
            const entry = entries.find(item => item.memberKey === key);
            const reward = entry ? leaderboardRewardForRank(Number(entry.rank)) : 0;
            if (!reward) return showResultPopup('Akun kamu tidak mendapat hadiah pada kategori ini.');
            try {
                const memberRef = membersRef.child(key);
                const result = await memberRef.transaction(member => {
                    if (!member) return;
                    member.leaderboardRewardClaims = member.leaderboardRewardClaims || {};
                    member.leaderboardRewardClaims[weekKey] = member.leaderboardRewardClaims[weekKey] || {};
                    if (member.leaderboardRewardClaims[weekKey][category]) return;
                    member.diamond = Number(member.diamond || 0) + reward;
                    member.leaderboardRewardClaims[weekKey][category] = { claimedAt: Date.now(), rank: Number(entry.rank), reward };
                    return member;
                }, undefined, false);
                if (result.committed) showResultPopup(`Berhasil klaim ${reward} 💎 dari papan peringkat ${category === 'star' ? 'Star' : category === 'diamond' ? 'Diamond' : 'Level'}!`);
                else showResultPopup('Hadiah kategori ini sudah pernah diklaim atau akun tidak ditemukan.');
            } catch (error) {
                console.error(error);
                showResultPopup('Gagal klaim hadiah. Coba lagi.');
            }
            renderLeaderboard();
        }

        function rankTierValue(rank) {
            const normalized = String(rank || '').trim().toLowerCase();
            const tiers = { warrior:1, elite:2, master:3, grandmaster:4, epic:5, legend:6, mythic:7, immortal:8, 'demon king':9 };
            return Object.prototype.hasOwnProperty.call(tiers, normalized) ? tiers[normalized] : 0;
        }

        function syncMemberHighestStats(memberKey, member) {
            if (!member || highestStatsSyncInProgress.has(memberKey)) return;
            const currentStars = Number(member.bintang || 0);
            const oldHighestStars = Number(member.bintangSeasonLalu ?? member.seasonLaluBintang ?? member.starsSeasonLalu ?? 0);
            const highestStars = Math.max(currentStars, oldHighestStars);
            const expectedHighestRank = getRankFromBintang(highestStars, 'Warrior');
            const oldHighestRank = String(member.rankTertinggiSeasonLalu || member.rankSeasonLalu || member.seasonLaluRank || '').trim();
            const starsShouldUpdate = currentStars > oldHighestStars;
            const rankShouldUpdate = oldHighestRank !== expectedHighestRank;
            if (!rankShouldUpdate && !starsShouldUpdate) return;
            highestStatsSyncInProgress.add(memberKey);
            membersRef.child(memberKey).transaction(current => {
                if (!current) return;
                const curStars = Number(current.bintang || 0);
                const highStars = Number(current.bintangSeasonLalu ?? current.seasonLaluBintang ?? current.starsSeasonLalu ?? 0);
                const bestStars = Math.max(curStars, highStars);
                current.bintangSeasonLalu = bestStars;
                current.rankTertinggiSeasonLalu = getRankFromBintang(bestStars, 'Warrior');
                return current;
            }, error => {
                if (error) console.error('Gagal memperbarui statistik tertinggi:', error);
                highestStatsSyncInProgress.delete(memberKey);
            }, false);
        }

        async function switchTab(tabName, pushHistory = true) {
            // Pengguna yang belum login hanya boleh membuka Profil dan Personalisasi.
            if (tabName !== 'profil' && tabName !== 'personal' && tabName !== 'personalisasi' && !activeLoggedInMemberKey) {
                showResultPopup('Login dulu untuk mengakses kategori ini.');
                return;
            }
            const levelRequirements = { pinjaman: 10, quest: 3, event: 3, arcade: 3, chat: 3, shop: 2 };
            const requiredLevel = levelRequirements[tabName];
            if (requiredLevel) {
                const memberKey = activeLoggedInMemberKey;
                let member = memberKey && globalMembersData[memberKey];
                // Ambil level terbaru dari Firebase agar pemeriksaan tidak memakai data lama.
                if (memberKey) {
                    try {
                        const latestSnapshot = await membersRef.child(memberKey).once('value');
                        if (latestSnapshot.exists()) {
                            member = latestSnapshot.val();
                            globalMembersData[memberKey] = member;
                        }
                    } catch (e) { console.error('Gagal memeriksa level terbaru:', e); }
                }
                const currentLevel = Number(member && member.level != null ? member.level : 1);
                if (!member || !memberKey || currentLevel < requiredLevel) {
                    showResultPopup(`Level kamu tidak memenuhi syarat. Syarat minimal adalah level ${requiredLevel}.`);
                    return;
                }
            }
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const targetBtn = document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`);
            if (targetBtn) targetBtn.classList.add('active');
            
            const targetTab = document.getElementById(`tab-${tabName}`);
            if (targetTab) targetTab.classList.add('active');
            if (tabName === 'shop' && typeof showShopView === 'function') showShopView('categories');
            if (tabName === 'leaderboard') ensureLeaderboardSnapshot();

            if (pushHistory) {
                history.pushState({ tab: tabName, modal: null }, '');
            }
        }

        function addItemToInventory(updates, memberKey, member, item) {
            const isProfile = String(item.itemType || '').toLowerCase().includes('profil');
            const field = isProfile ? 'unlockedHiasanProfil' : 'unlockedHiasan';
            const arr = getItemArray(member[field]);
            arr.push(item.itemId);
            updates[`members/${memberKey}/${field}`] = arr;
            return arr;
        }

        function stackItemDuration(updates, memberKey, member, itemId, addedDays) {
            // Item permanen menghapus expiry lama, termasuk masa trial yang masih berjalan.
            if (!addedDays || addedDays <= 0) {
                updates[`members/${memberKey}/itemExpiries/${itemId}`] = null;
                if (member.itemExpiries) delete member.itemExpiries[itemId];
                return 0;
            }
            const now = Date.now();
            const addedMs = addedDays * 86400000;
            const currentExp = (member.itemExpiries && Number(member.itemExpiries[itemId])) || 0;
            const baseTime = (currentExp > now) ? currentExp : now;
            const newExp = baseTime + addedMs;

            member.itemExpiries = member.itemExpiries || {};
            member.itemExpiries[itemId] = newExp;
            updates[`members/${memberKey}/itemExpiries/${itemId}`] = newExp;
            return newExp;
        }

        // Hapus item yang masa aktifnya sudah lewat dari inventory dan lepaskan jika sedang dipakai.
        function cleanupExpiredItemsForMember(memberKey, member) {
            if (!member || !member.itemExpiries) return;
            const now = Date.now();
            const updates = {};
            const expiredIds = Object.keys(member.itemExpiries).filter(id => {
                const exp = Number(member.itemExpiries[id] || 0);
                return exp > 0 && exp <= now;
            });
            if (!expiredIds.length) return;

            const categories = [
                ['unlockedHiasan', 'hiasanNama', 'default'],
                ['unlockedHiasanProfil', 'hiasanProfil', 'default'],
                ['unlockedHiasanDetailProfil', 'hiasanDetailProfil', 'default'],
                ['unlockedTitles', 'gelar', '-']
            ];
            expiredIds.forEach(id => {
                categories.forEach(([field, equippedField, fallback]) => {
                    const arr = getItemArray(member[field]);
                    const filtered = arr.filter(item => item !== id);
                    if (filtered.length !== arr.length) {
                        updates[`members/${memberKey}/${field}`] = filtered;
                        member[field] = filtered;
                    }
                    if (member[equippedField] === id) {
                        updates[`members/${memberKey}/${equippedField}`] = fallback;
                        member[equippedField] = fallback;
                    }
                });
                updates[`members/${memberKey}/itemExpiries/${id}`] = null;
                delete member.itemExpiries[id];
                if (id === 'spesial_ungu') {
                    updates[`members/${memberKey}/spesialUnguExpiresAt`] = null;
                    if (member.spesialUnguExpiresAt) delete member.spesialUnguExpiresAt;
                }
            });

            if (expiredIds.includes('vip_plus_gold')) {
                updates[`members/${memberKey}/isVipPlus`] = false;
                updates[`members/${memberKey}/isVip`] = false;
                updates[`members/${memberKey}/boost`] = Math.max(1, Math.min(Number(member.boost || 1), 2));
                if (member.gelar === 'VIP Plus Member') {
                    updates[`members/${memberKey}/gelar`] = '-';
                    member.gelar = '-';
                }
                member.isVipPlus = false;
                member.isVip = false;
            }
            if (Object.keys(updates).length) database.ref().update(updates).catch(err => console.error('Gagal membersihkan item kedaluwarsa:', err));
        }
