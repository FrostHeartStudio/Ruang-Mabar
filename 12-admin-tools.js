// Ruang Mabar module: 12-admin-tools.js
// Keep this file loaded in the order declared in index.html.
        // ADMIN SETTINGS & PRESETS
        function updateShopPresetOptions() {
            const tipe = document.getElementById('adminShopTipe').value;
            const presetSelect = document.getElementById('adminShopPreset');
            const gelarContainer = document.getElementById('adminShopGelarContainer');
            const ticketCountContainer = document.getElementById('adminShopTicketCountContainer');
            if (ticketCountContainer) ticketCountContainer.style.display = tipe === 'Tiket' ? 'block' : 'none';
            presetSelect.innerHTML = '';

            if (tipe === 'Hiasan Nama') {
                gelarContainer.style.display = 'none';
                const opts = [
                    { val: 'vip_gold', label: 'Emas VIP (Shiny Gold)' },
                    { val: 'vip_plus_gold', label: 'Emas VIP Plus (Ultra Shiny Gold)' },
                    { val: 'limited_shiny', label: 'Limited Shiny' },
                    { val: 'spesial_ungu', label: 'Ungu Shiny' },
                    { val: 'keberuntungan', label: 'Keberuntungan' },
                    { val: 'terpilih', label: 'Terpilih' },
                    { val: 'rose_shiny', label: 'Mawar Pink Shiny' },
                    { val: 'cyan_shiny', label: 'Biru Cyan Shiny' },
                    { val: 'orange_shiny', label: 'Jingga Api Shiny' },
                    { val: 'silver_shiny', label: 'Perak Kristal Shiny' },
                    { val: 'rainbow_shiny', label: 'Pelangi Prisma Shiny' },
                    { val: 'amethyst_shiny', label: 'Amethyst Nebula' },
                    { val: 'lava_shiny', label: 'Lava Core' },
                    { val: 'mint_shiny', label: 'Mint Glacier' },
                    { val: 'sakura_shiny', label: 'Sakura Moon' },
                    { val: 'sunset_shiny', label: 'Senja Astral' },
                    { val: 'ocean_shiny', label: 'Ocean Abyss' },
                    { val: 'aurora_shiny', label: 'Aurora Borealis' },
                    { val: 'obsidian_shiny', label: 'Obsidian Flame' },
                    { val: 'golden_sky_shiny', label: 'Golden Sky' },
                    { val: 'void_shiny', label: 'Void Eclipse' },
                    { val: 'halloween_pumpkin_name', label: 'Halloween - Pumpkin Glow' }
                ];
                opts.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.val; opt.textContent = o.label;
                    presetSelect.appendChild(opt);
                });
            } else if (tipe === 'Hiasan Profil') {
                gelarContainer.style.display = 'none';
                const opts = [
                    { val: 'biru_bercahaya', label: 'Hiasan Profil Diamond' },
                    { val: 'kuning_border_ijo', label: 'Hiasan Profil Kuning' },
                    { val: 'hitam_ornamen', label: 'Hiasan Profil Hitam Ornamen' },
                    { val: 'hijau_ornamen', label: 'Hiasan Profil Hijau Ornamen' },
                    { val: 'vip_plus_gold', label: 'Hiasan Profil VIP Plus Gold Shiny' },
                    { val: 'crystal_ungu', label: 'Hiasan Profil Crystal Ungu' },
                    { val: 'aurora_cerah', label: 'Hiasan Profil Langit Malam' },
                    { val: 'sakura_bersemi', label: 'Hiasan Profil Sakura Bersemi' },
                    { val: 'api_naga', label: 'Hiasan Profil Api Naga' },
                    { val: 'petir_neon', label: 'Hiasan Profil Petir Neon' },
                    { val: 'emerald_venom', label: 'Hiasan Profil Racun Emerald' },
                    { val: 'debu_kosmik', label: 'Hiasan Profil Debu Kosmik' },
                    { val: 'phoenix_ember', label: 'Hiasan Profil Phoenix Ember' },
                    { val: 'neon_matrix', label: 'Hiasan Profil Neon Matrix' },
                    { val: 'halloween_haunted_profile', label: 'Halloween - Haunted Pumpkin' },
                    { val: 'frost_relic', label: 'Hiasan Profil Relik Es' },
                    { val: 'desert_mirage', label: 'Hiasan Profil Mirage Gurun' },
                    { val: 'deep_space', label: 'Hiasan Profil Deep Space' },
                ];
                opts.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.val; opt.textContent = o.label;
                    presetSelect.appendChild(opt);
                });
            } else if (tipe === 'Kotak Nama') {
                gelarContainer.style.display = 'none';
                [
                    { val: 'royal', label: 'Kotak Nama Royal' },
                    { val: 'neon', label: 'Kotak Nama Neon' },
                    { val: 'frost', label: 'Kotak Nama Frost' },
                    { val: 'nature', label: 'Kotak Nama Nature' },
                    { val: 'cosmic', label: 'Kotak Nama Cosmic' },
                    { val: 'halloween_candy_box', label: 'Halloween - Candy Basket' }
                ].forEach(o => { const opt = document.createElement('option'); opt.value = o.val; opt.textContent = o.label; presetSelect.appendChild(opt); });
            } else if (tipe === 'Hiasan Detail Profil') {
                gelarContainer.style.display = 'none';
                const opts = [
                    { val: 'detail_aurora', label: 'Aurora Menari' },
                    { val: 'detail_circuit', label: 'Cyber Circuit' },
                    { val: 'detail_ocean', label: 'Gelombang Samudra' },
                    { val: 'detail_prism', label: 'Prisma Pelangi' },
                    { val: 'detail_galaxy', label: 'Galaksi Bintang' },
                    { val: 'detail_solar', label: 'Solar Flare' },
                    { val: 'detail_frost', label: 'Kristal Beku' },
                    { val: 'detail_emerald', label: 'Jantung Emerald' },
                    { val: 'detail_crimson', label: 'Nebula Crimson' },
                    { val: 'detail_celestial', label: 'Arus Celestial' },
                    { val: 'halloween_dark_detail', label: 'Halloween - Midnight Haunt' }
                ];
                opts.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.val; opt.textContent = o.label;
                    presetSelect.appendChild(opt);
                });
            } else if (tipe === 'Kotak Nama') {
                gelarContainer.style.display = 'none';
                [
                    { val: 'royal', label: 'Kotak Nama Royal' },
                    { val: 'neon', label: 'Kotak Nama Neon' },
                    { val: 'frost', label: 'Kotak Nama Frost' },
                    { val: 'nature', label: 'Kotak Nama Nature' },
                    { val: 'cosmic', label: 'Kotak Nama Cosmic' }
                ].forEach(o => { const opt = document.createElement('option'); opt.value = o.val; opt.textContent = o.label; presetSelect.appendChild(opt); });
            } else if (tipe === 'Lencana') {
                gelarContainer.style.display = 'none';
                [
                    { val: 'halloween_candy_hunter', label: 'Halloween - Candy Hunter' }
                ].forEach(o => { const opt = document.createElement('option'); opt.value = o.val; opt.textContent = o.label; presetSelect.appendChild(opt); });
            } else if (tipe === 'Tiket') {
                gelarContainer.style.display = 'none';
                [
                    { val: 'play_ticket', label: 'Play Tiket' },
                    { val: 'super_ticket', label: 'Super Tiket' }
                ].forEach(o => { const opt = document.createElement('option'); opt.value = o.val; opt.textContent = o.label; presetSelect.appendChild(opt); });
            } else if (tipe === 'Gelar') {
                gelarContainer.style.display = 'block';
            } else {
                gelarContainer.style.display = 'none';
                const opt = document.createElement('option');
                opt.value = 'none'; opt.textContent = 'Standar';
                presetSelect.appendChild(opt);
            }
        }

        function toggleAdminCustomExpiry() {
            const tipe = document.getElementById('adminShopMasaBerlakuTipe').value;
            document.getElementById('adminShopCustomExpiryContainer').style.display = (tipe === 'custom') ? 'block' : 'none';
        }

        function adminAddShopItem() {
            const nama = document.getElementById('adminShopNama').value.trim();
            const tipe = document.getElementById('adminShopTipe').value;
            const preset = document.getElementById('adminShopPreset').value;
            const gelarInput = document.getElementById('adminShopGelarInput').value.trim();
            const masaTipe = document.getElementById('adminShopMasaBerlakuTipe').value;
            const masaHari = Number(document.getElementById('adminShopCustomHari').value || 0);
            const tipePembelian = document.getElementById('adminShopTipePembelian').value;
            const harga = Number(document.getElementById('adminShopHarga').value || 0);
            const stok = Number(document.getElementById('adminShopStok').value || 0);
            const ticketCount = Math.max(1, Number(document.getElementById('adminShopTicketCount')?.value || 1));

            if (!nama) { alert("Nama item tidak boleh kosong!"); return; }

            const newItem = {
                nama: nama,
                tipe: tipe,
                preset: preset,
                ticketCount: tipe === 'Tiket' ? ticketCount : 0,
                gelarValue: (tipe === 'Gelar') ? gelarInput : '',
                masaBerlakuTipe: masaTipe,
                masaBerlakuHari: masaHari,
                tipePembelian: tipePembelian,
                harga: harga,
                stok: stok,
                createdAt: Date.now()
            };

            alert("✅ Item berhasil ditambahkan ke Shop!");
            document.getElementById('adminShopNama').value = '';
            document.getElementById('adminShopHarga').value = '';
            document.getElementById('adminShopStok').value = '';
            shopRef.push(newItem);
        }

        function adminSaveEvent() {
            const judul = document.getElementById('adminEventJudul').value.trim();
            const content = document.getElementById('adminEventText').value.trim();
            if (!judul) { alert("Judul pengumuman tidak boleh kosong!"); return; }

            alert("✅ Pengumuman berhasil dipublikasikan!");
            document.getElementById('adminEventJudul').value = '';
            document.getElementById('adminEventText').value = '';
            eventsRef.push({ judul: judul, content: content, createdAt: Date.now() });
        }

        function toggleAdminRewardInput() {
            const type = document.getElementById('adminCodeRewardType').value;
            const valueContainer = document.getElementById('adminCodeValContainer');
            const presetContainer = document.getElementById('adminCodePresetContainer');
            const presetSelect = document.getElementById('adminCodePresetSelect');
            const presetLabel = document.getElementById('adminCodePresetLabel');
            const gelarContainer = document.getElementById('adminCodeGelarContainer');
            gelarContainer.style.display = type === 'gelar' ? 'block' : 'none';

            const optionSets = {
                hiasan_nama: hiasanNamaMap,
                hiasan_profil: hiasanProfilMap,
                hiasan_detail_profil: hiasanDetailProfilMap,
                kotak_nama: { royal: 'Kotak Nama Royal', neon: 'Kotak Nama Neon', frost: 'Kotak Nama Frost', nature: 'Kotak Nama Nature', cosmic: 'Kotak Nama Cosmic' },
                lencana: {
                    immortal: 'Immortal',
                    demon_king: 'Demon King',
                    first_season: 'First Season'
                }
            };
            const labels = {
                hiasan_nama: 'Pilih Hiasan Nama:',
                hiasan_profil: 'Pilih Hiasan Profil:',
                hiasan_detail_profil: 'Pilih Hiasan Detail Profil:',
                kotak_nama: 'Pilih Kotak Nama:',
                lencana: 'Pilih Lencana:'
            };
            const needsPreset = Object.prototype.hasOwnProperty.call(optionSets, type);
            valueContainer.style.display = ['gelar', 'vip_plus', 'hiasan_nama', 'hiasan_profil', 'hiasan_detail_profil', 'kotak_nama', 'lencana'].includes(type) ? 'none' : 'block';
            presetContainer.style.display = needsPreset ? 'block' : 'none';
            if (needsPreset) {
                presetLabel.textContent = labels[type];
                const previous = presetSelect.value;
                presetSelect.innerHTML = '';
                Object.entries(optionSets[type]).forEach(([id, label]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = (type === 'lencana' ? ({ immortal: '🏅 ', demon_king: '🌙 ', first_season: '🌟 ' }[id] || '') : '') + label;
                    presetSelect.appendChild(option);
                });
                if ([...presetSelect.options].some(option => option.value === previous)) presetSelect.value = previous;
            }
        }

        // Isi pilihan reward redeem sesuai kategori agar hiasan nama, profil, detail, dan lencana tidak tercampur.
        document.addEventListener('DOMContentLoaded', () => {
            toggleAdminRewardInput();
            document.addEventListener('click', event => {
                const detailButton = event.target.closest && event.target.closest('.btn-profile-detail');
                const galleryButton = event.target.closest && event.target.closest('.btn-profile-gallery');
                const button = detailButton || galleryButton;
                if (!button) return;
                const card = button.closest('.member-card');
                const key = card && card.dataset.memberKey;
                if (!key) return;
                event.preventDefault();
                event.stopPropagation();
                if (galleryButton) openPlayerGallery(key);
                else openProfileDetailModal(key);
            });
        });

        function adminCreateCode() {
            const codeText = document.getElementById('adminCodeText').value.trim().toUpperCase();
            const type = document.getElementById('adminCodeRewardType').value;
            const value = Number(document.getElementById('adminCodeValue').value || 0);
            const preset = document.getElementById('adminCodePresetSelect').value;
            const gelar = document.getElementById('adminCodeGelarInput').value.trim();

            if (!codeText) { alert("Ketik kode unik terlebih dahulu!"); return; }
            if (type === 'gelar' && !gelar) { alert("Masukkan gelar terlebih dahulu!"); return; }
            if (globalCodesData[codeText]) { alert(" Kode tersebut sudah ada! Gunakan kode lain."); return; }

            const redeemMode = document.getElementById('adminCodeRedeemMode').value;

            const codeData = {
                type: type,
                value: value,
                preset: preset,
                gelar: gelar,
                redeemMode: redeemMode,
                label: type === 'gelar' ? gelar : (type === 'vip_plus' ? 'VIP Plus Member' : (['hiasan_nama','hiasan_profil','hiasan_detail_profil','lencana'].includes(type) ? ((type === 'hiasan_nama' ? hiasanNamaMap[preset] : type === 'hiasan_profil' ? hiasanProfilMap[preset] : type === 'hiasan_detail_profil' ? hiasanDetailProfilMap[preset] : ({immortal:'Immortal',demon_king:'Demon King',first_season:'First Season'}[preset])) || preset) : `${value} ${type}`))
            };

            alert(`✅ Kode reward ${codeText} berhasil dibuat!`);
            document.getElementById('adminCodeText').value = '';
            codesRef.child(codeText).set(codeData);
        }

        function adminAddArcadeLink() {
            const judul = document.getElementById('adminArcadeJudul').value.trim();
            const deskripsi = document.getElementById('adminArcadeDeskripsi').value.trim();
            const link = document.getElementById('adminArcadeLink').value.trim();

            if (!judul || !link) { alert("Judul dan Link wajib diisi!"); return; }

            alert("✅ Tautan arcade berhasil ditambahkan!");
            document.getElementById('adminArcadeJudul').value = '';
            document.getElementById('adminArcadeDeskripsi').value = '';
            document.getElementById('adminArcadeLink').value = '';
            arcadeRef.push({ judul, deskripsi, link, createdAt: Date.now() });
        }


        function openArcadeSite(judul, link) {
            const destination = String(link || '').trim();
            if (!destination) {
                showResultPopup('Link website Arcade belum tersedia.');
                return;
            }
            let parsedUrl;
            try {
                parsedUrl = new URL(destination, window.location.href);
            } catch (error) {
                showResultPopup('Link website Arcade tidak valid.');
                return;
            }
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                showResultPopup('Link website Arcade tidak valid.');
                return;
            }
            const confirmed = window.confirm(`Yakin, ingin pergi ke ${String(judul || 'website ini')} dan menutup Profil Ruang Mabar?`);
            if (confirmed) window.location.href = parsedUrl.href;
        }

        function renderArcadeLinks() {
            const list = document.getElementById('arcade-link-list');
            if (!list) return;
            list.innerHTML = '';
            const keys = Object.keys(globalArcadeData || {});
            if (!keys.length) {
                list.innerHTML = '<div class="empty-notice">Belum ada game atau website Arcade yang ditautkan.</div>';
                return;
            }
            keys.sort((a, b) => Number(globalArcadeData[b]?.createdAt || 0) - Number(globalArcadeData[a]?.createdAt || 0));
            keys.forEach(key => {
                const item = globalArcadeData[key] || {};
                const card = document.createElement('div');
                card.className = 'arcade-card';
                card.style.marginTop = '12px';
                card.style.position = 'relative';
                card.setAttribute('role', 'link');
                card.setAttribute('tabindex', '0');
                card.innerHTML = `
                    ${isAdminLoggedIn ? `<button type="button" title="Edit Arcade" aria-label="Edit Arcade" style="position:absolute;top:9px;right:9px;width:34px;height:34px;border:1px solid rgba(255,255,255,.35);border-radius:10px;background:rgba(255,255,255,.12);color:white;cursor:pointer;z-index:2;" onclick="event.stopPropagation();openArcadeEdit('${key}')">✏️</button>` : ''}
                    <div style="padding-right:${isAdminLoggedIn ? '42px' : '0'};"><h4 style="font-size:.98rem;margin-bottom:4px;">${escapeHTML(item.judul || 'Arcade')}</h4>
                    ${item.deskripsi ? `<p style="font-size:.78rem;opacity:.86;line-height:1.45;margin-bottom:8px;">${escapeHTML(item.deskripsi)}</p>` : ''}
                    <span style="display:inline-block;text-decoration:underline;font-size:.88rem;">Buka website ↗</span></div>
                `;
                card.addEventListener('click', () => openArcadeSite(item.judul || 'Arcade', item.link || ''));
                card.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openArcadeSite(item.judul || 'Arcade', item.link || '');
                    }
                });
                list.appendChild(card);
            });
        }

        function openArcadeEdit(key) {
            if (!isAdminLoggedIn) { showResultPopup('Hanya admin yang dapat mengedit tautan Arcade.'); return; }
            const item = globalArcadeData[key];
            if (!item) return;
            document.getElementById('arcadeEditKey').value = key;
            document.getElementById('arcadeEditTitle').value = item.judul || '';
            document.getElementById('arcadeEditDescription').value = item.deskripsi || '';
            document.getElementById('arcadeEditLink').value = item.link || '';
            openModal('arcadeEditModal');
        }

        async function saveArcadeEdit() {
            if (!isAdminLoggedIn) { showResultPopup('Hanya admin yang dapat mengedit tautan Arcade.'); return; }
            const key = document.getElementById('arcadeEditKey').value;
            const judul = document.getElementById('arcadeEditTitle').value.trim();
            const deskripsi = document.getElementById('arcadeEditDescription').value.trim();
            const link = document.getElementById('arcadeEditLink').value.trim();
            if (!globalArcadeData[key]) return;
            if (!judul) { showResultPopup('Nama Arcade tidak boleh kosong.'); return; }
            if (!/^https?:\/\//i.test(link)) { showResultPopup('URL Arcade harus diawali http:// atau https://.'); return; }
            try {
                await arcadeRef.child(key).update({ judul, deskripsi, link });
                closeModal('arcadeEditModal');
                showResultPopup('Informasi Arcade berhasil diperbarui!');
            } catch (e) { showResultPopup('Gagal memperbarui Arcade. Coba lagi.'); }
        }

        function adminDeleteArcade(key) {
            if (!key || !globalArcadeData[key]) return;
            arcadeRef.child(key).remove();
        }

        function populateAdminShopList() {
            const list = document.getElementById('admin-shop-delete-list');
            if (!list) return;
            list.innerHTML = '';
            Object.keys(globalShopData).forEach(key => {
                const item = globalShopData[key];
                const row = document.createElement('div');
                row.className = 'admin-member-row';
                row.innerHTML = `<span><strong>${escapeHTML(item.nama)}</strong></span><button class="btn-del-mini" onclick="shopRef.child('${key}').remove()">🗑️ Hapus</button>`;
                list.appendChild(row);
            });
        }
