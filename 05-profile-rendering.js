// Ruang Mabar module: 05-profile-rendering.js
// Keep this file loaded in the order declared in index.html.
        // RENDER PROFIL MEMBER DENGAN EFEK SHINY DAN EMOJI PADA MASA AKTIF
        function getProfileBadgesHTML(member) {
            const badgeNames = {
                immortal: { icon: '🏅', label: 'Immortal', cls: 'immortal' },
                demon_king: { icon: '🌙', label: 'Demon King', cls: 'demon-king' },
                first_season: { icon: '🌟', label: 'First Season', cls: 'first-season' }
            };
            let selected = member && (member.lencanaDitampilkan ?? member.lencanaProfil);
            if (Array.isArray(selected)) selected = selected[0] || '';
            selected = selected ? String(selected) : '';
            if (member && member.lencanaDitampilkan == null && !selected && member.lencanaImmortal) selected = 'immortal';
            const earned = getItemArray(member && member.unlockedBadges);
            const legacy = Array.isArray(member && member.lencanaProfil) ? member.lencanaProfil : [member && member.lencanaProfil].filter(Boolean);
            const allowed = [...new Set([...earned, ...legacy, ...(member && member.lencanaImmortal ? ['immortal'] : [])])];
            if (!badgeNames[selected] || (allowed.length && !allowed.includes(selected))) return '';
            const badge = badgeNames[selected];
            return `<span class="profile-badge ${badge.cls}"><span>${badge.icon} ${badge.label}</span></span>`;
        }

        function filterAndRenderMembers() {
            const memberList = document.getElementById('member-list');
            memberList.innerHTML = '';

            const searchQuery = (document.getElementById('searchProfileInput').value || '').toLowerCase().trim();

            const sortedMemberKeys = Object.keys(globalMembersData).sort((a, b) => {
                const mA = globalMembersData[a];
                const mB = globalMembersData[b];
                const bintangA = Number(mA.bintang || 0);
                const bintangB = Number(mB.bintang || 0);
                if (bintangA !== bintangB) return bintangB - bintangA;
                return Number(mB.level || 1) - Number(mA.level || 1);
            });

            sortedMemberKeys.forEach((key) => {
                const item = globalMembersData[key];
                const nama = (item.nama || '').toLowerCase();

                if (searchQuery && !nama.includes(searchQuery)) return;

                let decorClass = "member-card";
                if (item.hiasanProfil === 'vip_plus_gold' && hasActiveVipPlus(item)) {
                    decorClass += " decor-vip-plus-gold";
                } else if (item.hiasanProfil === 'kuning_border_ijo') {
                    decorClass += " decor-yellow";
                } else if (item.hiasanProfil === 'biru_bercahaya') {
                    decorClass += " decor-biru-bercahaya";
                } else if (item.hiasanProfil === 'hitam_ornamen') {
                    decorClass += " decor-hitam-ornamen";
                } else if (item.hiasanProfil === 'hijau_ornamen') {
                    decorClass += " decor-hijau-ornamen";
                } else if (item.hiasanProfil === 'crystal_ungu') {
                    decorClass += " decor-crystal-ungu";
                } else if (item.hiasanProfil === 'aurora_cerah') {
                    decorClass += " decor-aurora-cerah";
                } else if (item.hiasanProfil === 'sakura_bersemi') {
                    decorClass += " decor-sakura-bersemi";
                } else if (item.hiasanProfil === 'api_naga') {
                    decorClass += " decor-api-naga";
                } else if (item.hiasanProfil === 'petir_neon') {
                    decorClass += " decor-petir-neon";
                } else if (item.hiasanProfil === 'emerald_venom') {
                    decorClass += " decor-emerald-venom";
                } else if (item.hiasanProfil === 'debu_kosmik') {
                    decorClass += " decor-debu-kosmik";
                } else if (item.hiasanProfil === 'phoenix_ember') {
                    decorClass += " decor-phoenix-ember";
                } else if (item.hiasanProfil === 'neon_matrix') {
                    decorClass += " decor-neon-matrix";
                } else if (item.hiasanProfil === 'frost_relic') {
                    decorClass += " decor-frost-relic";
                } else if (item.hiasanProfil === 'desert_mirage') {
                    decorClass += " decor-desert-mirage";
                } else if (item.hiasanProfil === 'deep_space') {
                    decorClass += " decor-deep-space";
                } else if (item.hiasanProfil === 'halloween_haunted_profile') {
                    decorClass += " decor-halloween-haunted";
                }

                let nameClass = "member-name";
                if (String(item.hiasanNama || '').trim() === 'vip_plus_gold' && hasActiveVipPlus(item)) {
                    nameClass = "member-name name-vip-plus-gold";
                } else if (String(item.hiasanNama || '').trim() === 'vip_gold') {
                    nameClass = "member-name name-gold-shiny";
                } else if (String(item.hiasanNama || '').trim() === 'limited_shiny') {
                    nameClass = "member-name name-green-shiny";
                } else if (String(item.hiasanNama || '').trim() === 'spesial_ungu') {
                    nameClass = "member-name name-purple-shiny";
                } else if (String(item.hiasanNama || '').trim() === 'keberuntungan') {
                    nameClass = "member-name name-red-shiny";
                } else if (String(item.hiasanNama || '').trim() === 'terpilih') {
                    nameClass = "member-name name-diamond-shiny";
                }
                else if (hiasanNamaClassMap[String(item.hiasanNama || '').trim()]) {
                    nameClass = "member-name " + hiasanNamaClassMap[String(item.hiasanNama || '').trim()];
                }
                
                let isGelarVipPlus = (item.gelar && item.gelar.toLowerCase().includes('vip plus'));
                let isGelarVip = (item.gelar && item.gelar.toLowerCase().includes('vip'));
                const gelarClass = isGelarVipPlus ? "member-gelar vip-plus" : (isGelarVip ? "member-gelar vip" : "member-gelar");
                const gelarHTML = (item.gelar && item.gelar !== '-') ? `<span class="${gelarClass}">${escapeHTML(item.gelar)}</span>` : '';
                const profileBadgesHTML = getProfileBadgesHTML(item);

                const calculatedRank = getRankFromBintang(item.bintang, item.rank);

                // Indikator Masa Aktif: Card hanya menampilkan 2 item yang paling cepat berakhir
                let durationItemsCardHTML = '';
                const now = Date.now();
                if (item.itemExpiries) {
                    const activeDurationItems = Object.keys(item.itemExpiries)
                        .map(itemId => ({ itemId, exp: Number(item.itemExpiries[itemId]) }))
                        .filter(entry => entry.exp > now)
                        .sort((a, b) => a.exp - b.exp)
                        .slice(0, 2);

                    activeDurationItems.forEach(({ itemId, exp }) => {
                        const diffMs = exp - now;
                        const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const timeStr = daysLeft > 0 ? `${daysLeft} Hari ${hoursLeft} Jam` : `${hoursLeft} Jam`;

                        let itemName = itemId;
                        if (hiasanNamaMap[itemId]) itemName = hiasanNamaMap[itemId];
                        else if (hiasanProfilMap[itemId]) itemName = hiasanProfilMap[itemId];
                        else if (hiasanDetailProfilMap[itemId]) itemName = hiasanDetailProfilMap[itemId];

                        const emoji = getItemDurationEmoji(itemId);
                        const shinyClass = getItemDurationShinyClass(itemId);

                        durationItemsCardHTML += `<div style="font-size: 0.8rem; font-weight: 700; margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span class="${shinyClass}">${emoji} ${escapeHTML(itemName)}: ${timeStr}</span></div>`;
                    });
                }

                const card = document.createElement('div');
                card.className = decorClass;
                card.dataset.memberKey = key;
                card.innerHTML = `
                    <button type="button" class="btn-profile-detail" title="Lihat Detail Profil" aria-label="Lihat Detail Profil">ℹ</button>
                    <button type="button" class="btn-profile-gallery" title="Galeri / Pajangan Player" aria-label="Galeri / Pajangan Player">🖼️</button>
                    <div class="member-header-row">
                        ${renderPlayerNameWithBox(item, nameClass, item.nama || 'Tanpa Nama')}
                        ${gelarHTML}
                    </div>
                    <div class="member-bio">${escapeHTML(item.bio || '-')}</div>
                    <div class="stats-grid">
                        <div class="stat-item">🏆 Rank: ${escapeHTML(calculatedRank)}</div>
                        <div class="stat-item">⭐ Bintang: ${item.bintang || 0}</div>
                        <div class="stat-item">💎 Diamond: ${item.diamond || 0}</div>
                        <div class="stat-item">⚡ Boost: ${item.boost || 1}x</div>
                        <div class="stat-item">📊 Lvl: ${item.level || 1}</div>
                        ${profileBadgesHTML ? `<div class="stat-item" style="display:flex;align-items:center;min-width:0;overflow:hidden;">${profileBadgesHTML}</div>` : ''}
                    </div>
                    ${durationItemsCardHTML ? `<div style="margin-top: 8px;">${durationItemsCardHTML}</div>` : ''}
                `;
                applyNewProfileDecorationEffects(card, item.hiasanProfil);
                memberList.appendChild(card);
            });
            if (!isRefreshingPersonalProfilePreview) refreshMemberPersonalProfilePreview();
        }

        let isRefreshingPersonalProfilePreview = false;
        function refreshMemberPersonalProfilePreview() {
            const target = document.getElementById('member-personal-profile-card');
            if (!target || !activeLoggedInMemberKey || isRefreshingPersonalProfilePreview) return;
            let sourceCard = Array.from(document.querySelectorAll('#member-list .member-card')).find(card => card.dataset.memberKey === activeLoggedInMemberKey);
            if (!sourceCard) {
                const searchInput = document.getElementById('searchProfileInput');
                if (!searchInput) return;
                isRefreshingPersonalProfilePreview = true;
                const previousQuery = searchInput.value;
                searchInput.value = '';
                filterAndRenderMembers();
                sourceCard = Array.from(document.querySelectorAll('#member-list .member-card')).find(card => card.dataset.memberKey === activeLoggedInMemberKey);
                searchInput.value = previousQuery;
                filterAndRenderMembers();
                isRefreshingPersonalProfilePreview = false;
                // Ambil ulang node setelah daftar dirender kembali agar preview tidak memakai card yang sudah terlepas.
                sourceCard = Array.from(document.querySelectorAll('#member-list .member-card')).find(card => card.dataset.memberKey === activeLoggedInMemberKey);
            }
            if (!sourceCard) return;
            // Salinan dibuat persis dari card profil asli tanpa mengubah class, ukuran, atau gayanya.
            const copy = sourceCard.cloneNode(true);
            copy.dataset.personalProfileCopy = 'true';
            target.replaceChildren(copy);
        }

        // Render detail terlebih dahulu, lalu tampilkan modal setelah kontennya siap.
        function openProfileDetailModal(key) {
            if (!globalMembersData[key]) return;
            const modal = document.getElementById('profileDetailModal');
            const content = document.getElementById('profileDetailContent');
            if (!modal || !content) return;
            renderProfileDetailModalContent(key);
            modal.style.display = 'flex';
            modal.style.zIndex = '10000';
        }

        function renderPlayerNameWithBox(member, nameClass, displayName, inlineStyle = '') {
            const safeName = escapeHTML(displayName || 'Tanpa Nama');
            const safeStyle = inlineStyle ? ` style="${inlineStyle}"` : '';
            const box = member && ['royal','neon','frost','nature','cosmic','halloween_candy_box'].includes(String(member.kotakNama || '')) ? String(member.kotakNama) : '';
            const nameHTML = `<span class="${nameClass}"${safeStyle}>${safeName}</span>`;
            return box ? `<span class="member-name-box-frame name-box-${box}">${nameHTML}</span>` : nameHTML;
        }
