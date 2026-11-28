// Ruang Mabar module: 08-marketplace.js
// Keep this file loaded in the order declared in index.html.
        // RENDER MARKETPLACE
        async function showShopView(view) {
            const categories = document.getElementById('shopCategoryView');
            const shopMain = document.getElementById('shop-main-content');
            const marketMain = document.getElementById('shop-marketplace-content');
            if (!categories || !shopMain || !marketMain) return;

            if (view === 'marketplace') {
                const memberKey = activeLoggedInMemberKey;
                if (!memberKey) {
                    showResultPopup('Login dulu untuk mengakses Marketplace.');
                    return;
                }
                let member = globalMembersData[memberKey];
                try {
                    const latestSnapshot = await membersRef.child(memberKey).once('value');
                    if (latestSnapshot.exists()) {
                        member = latestSnapshot.val();
                        globalMembersData[memberKey] = member;
                    }
                } catch (e) { console.error('Gagal memeriksa level terbaru:', e); }
                if (!member || Number(member.level != null ? member.level : 1) < 5) {
                    showResultPopup('Level kamu tidak memenuhi syarat. Syarat minimal adalah level 5.');
                    return;
                }
            }

            categories.style.display = view === 'categories' ? '' : 'none';
            shopMain.style.display = view === 'official' ? 'block' : 'none';
            marketMain.style.display = view === 'marketplace' ? 'block' : 'none';

            if (view === 'official' && typeof showShopOfficialCategories === 'function') {
                showShopOfficialCategories();
            }
            if (view === 'marketplace') {
                renderMarketplace();
                refreshMarketplaceDiamond();
            }
        }

        // Dipertahankan agar pemanggilan lama tetap kompatibel.
        async function toggleShopMarketplace(showMarketplace) {
            return showShopView(showMarketplace ? 'marketplace' : 'categories');
        }

        function refreshMarketplaceDiamond() {
            const el = document.getElementById('marketplace-player-diamond');
            if (!el) return;
            const member = activeLoggedInMemberKey && globalMembersData[activeLoggedInMemberKey];
            el.textContent = member ? `💎 Diamond kamu saat ini: ${Number(member.diamond || 0).toLocaleString('id-ID')}` : '💎 Diamond kamu: Login untuk melihat saldo.';
        }

        function renderMarketplace() {
            const list = document.getElementById('marketplace-item-list');
            if (!list) return;
            list.innerHTML = '';
            const searchText = (document.getElementById('marketplace-search')?.value || '').trim().toLocaleLowerCase('id-ID');
            const keys = Object.keys(globalMarketplaceData || {}).sort((a, b) => Number(globalMarketplaceData[b]?.createdAt || 0) - Number(globalMarketplaceData[a]?.createdAt || 0));
            if (!keys.length) {
                list.innerHTML = '<div class="empty-notice" style="padding:16px;">Belum ada item yang dijual di marketplace.</div>';
                return;
            }
            keys.forEach(key => {
                const item = globalMarketplaceData[key] || {};
                const itemName = hiasanNamaMap[item.itemId] || hiasanProfilMap[item.itemId] || hiasanDetailProfilMap[item.itemId] || item.itemId || 'Item';
                const searchable = `${itemName} ${item.tipe || ''} ${item.sellerName || ''}`.toLocaleLowerCase('id-ID');
                if (searchText && !searchable.includes(searchText)) return;
                const isSeller = !!activeLoggedInMemberKey && item.sellerKey === activeLoggedInMemberKey;
                const card = document.createElement('div');
                card.className = 'shop-item-card marketplace-item-card';
                card.innerHTML = `
                    <div class="shop-card-main">
                        <div class="shop-card-copy">
                            <div class="shop-title-row">
                                <div class="shop-title-viewport" tabindex="0" role="region" aria-label="Judul item, geser horizontal untuk membaca lengkap" title="Geser untuk membaca judul lengkap"><span class="shop-title-text shop-title">${escapeHTML(itemName)}</span></div>
                                ${isSeller ? `<button type="button" class="marketplace-edit-button" title="Edit penjualan" aria-label="Edit penjualan" onclick="editMarketplacePrice('${key}')">✎</button>` : ''}
                            </div>
                            <div class="shop-type-tag">${escapeHTML(item.tipe || 'Item')}</div>
                            <div class="marketplace-seller">Penjual <strong>${escapeHTML(item.sellerName || 'Member')}</strong></div>
                            <div class="shop-expiry">Masa aktif <strong>♾️ Permanen</strong></div>
                        </div>
                    </div>
                    <div class="shop-card-divider" aria-hidden="true"></div>
                    <div class="shop-card-footer">
                        <div class="shop-price">💎 ${Number(item.harga || 0).toLocaleString('id-ID')}</div>
                        <div class="shop-stock">Stok ${Math.max(0, Number(item.stok || 0))}</div>
                        <button type="button" class="btn-buy" onclick="buyMarketplaceItem('${key}')">Beli</button>
                    </div>`;
                list.appendChild(card);
            });
            enableShopTitleScrolling(list);
            if (searchText && !list.children.length) list.innerHTML = '<div class="empty-notice" style="padding:16px;">Barang tidak ditemukan.</div>';
        }

        function openMarketplaceSellFaq() {
            openModal('marketplaceSellFaqModal');
        }

        function openSellItemModal() {
            if (!activeLoggedInMemberKey) {
                alert("Silakan login terlebih dahulu di tab Personalisasi sebelum menjual item!");
                toggleShopMarketplace(false);
                switchTab('personal');
                return;
            }

            const member = globalMembersData[activeLoggedInMemberKey];
            const select = document.getElementById('inputMarketSellItemSelect');
            select.innerHTML = '<option value="">-- Pilih Hiasan --</option>';

            const categories = [
                { key: 'nama', field: 'unlockedHiasan', map: hiasanNamaMap, label: 'Hiasan Nama' },
                { key: 'profil', field: 'unlockedHiasanProfil', map: hiasanProfilMap, label: 'Hiasan Profil' },
                { key: 'detail', field: 'unlockedHiasanDetailProfil', map: hiasanDetailProfilMap, label: 'Hiasan Detail Profil' }
            ];
            categories.forEach(cat => {
                const available = getItemArray(member[cat.field]).filter(id => isItemAvailable(member, id));
                const counts = getItemCounts(available);
                Object.keys(counts).forEach(id => {
                    if (['vip_gold', 'vip_plus_gold'].includes(id)) return;
                    if (counts[id] < 2) return;
                    const opt = document.createElement('option');
                    opt.value = `${cat.key}|${id}`;
                    opt.textContent = `${cat.label}: ${cat.map[id] || id} (${counts[id]} dimiliki)`;
                    select.appendChild(opt);
                });
            });

            openModal('sellItemModal');
            updateSellItemMaxStock();
        }

        function updateSellItemMaxStock() {
            const val = document.getElementById('inputMarketSellItemSelect').value;
            const tipeInput = document.getElementById('inputMarketSellTipe');
            const stokInput = document.getElementById('inputMarketSellStok');
            const notice = document.getElementById('sellStockNotice');

            if (!val || !activeLoggedInMemberKey) {
                tipeInput.value = '';
                stokInput.value = 1;
                stokInput.max = 1;
                if (notice) notice.textContent = 'Pilih item yang memiliki minimal 2 stok.';
                return;
            }

            const [tipe, itemId] = val.split('|');
            const member = globalMembersData[activeLoggedInMemberKey];
            const field = tipe === 'nama' ? 'unlockedHiasan' : tipe === 'profil' ? 'unlockedHiasanProfil' : 'unlockedHiasanDetailProfil';
            const counts = getItemCounts(getItemArray(member[field]).filter(id => isItemAvailable(member, id)));
            const totalOwned = counts[itemId] || 0;
            const maxSellable = Math.max(0, totalOwned - 1);
            tipeInput.value = tipe === 'nama' ? 'Hiasan Nama' : tipe === 'profil' ? 'Hiasan Profil' : 'Hiasan Detail Profil';
            stokInput.readOnly = false;
            stokInput.max = maxSellable;
            stokInput.min = 1;
            stokInput.value = maxSellable > 0 ? 1 : 0;
            if (notice) notice.textContent = `Kamu punya ${totalOwned} item. Maksimal dijual ${maxSellable}; minimal 1 item harus tetap tersisa di inventory.`;
        }

        function submitSellItemMarketplace() {
            if (!activeLoggedInMemberKey) return;
            const val = document.getElementById('inputMarketSellItemSelect').value;
            const harga = Number(document.getElementById('inputMarketSellHarga').value || 0);
            const stokInput = document.getElementById('inputMarketSellStok');
            const stok = Math.floor(Number(stokInput.value || 0));

            if (!val) { alert("Pilih hiasan yang ingin dijual!"); return; }
            if (!Number.isFinite(harga) || harga <= 0) { alert("Harga jual minimal 1 Diamond!"); return; }
            if (!Number.isFinite(stok) || stok < 1) { alert("Jumlah stok jual minimal 1!"); return; }

            const [tipeKey, itemId] = val.split('|');
            if (['vip_gold', 'vip_plus_gold'].includes(itemId) || tipeKey === 'vip' || tipeKey === 'vip_plus') {
                alert("Manfaat VIP / VIP Plus tidak dapat dijual di Marketplace!");
                return;
            }
            const member = globalMembersData[activeLoggedInMemberKey];
            const memberKey = activeLoggedInMemberKey;
            const field = tipeKey === 'nama' ? 'unlockedHiasan' : tipeKey === 'profil' ? 'unlockedHiasanProfil' : 'unlockedHiasanDetailProfil';
            const unlockedArr = getItemArray(member[field]);
            const availableArr = unlockedArr.filter(id => isItemAvailable(member, id));
            const totalOwned = availableArr.filter(id => id === itemId).length;
            if (stok > totalOwned - 1) {
                alert(`Stok tidak cukup. Kamu punya ${totalOwned}; maksimal bisa menjual ${Math.max(0, totalOwned - 1)} dan harus menyisakan 1 item.`);
                updateSellItemMaxStock();
                return;
            }

            let remainingToRemove = stok;
            const newUnlockedArr = unlockedArr.filter(id => {
                if (id !== itemId || remainingToRemove <= 0) return true;
                remainingToRemove--;
                return false;
            });
            const updates = {};
            updates[`members/${memberKey}/${field}`] = newUnlockedArr;

            if (tipeKey === 'nama' && member.hiasanNama === itemId && newUnlockedArr.indexOf(itemId) === -1) {
                updates[`members/${memberKey}/hiasanNama`] = 'default';
            } else if (tipeKey === 'profil' && member.hiasanProfil === itemId && newUnlockedArr.indexOf(itemId) === -1) {
                updates[`members/${memberKey}/hiasanProfil`] = 'default';
            } else if (tipeKey === 'detail' && member.hiasanDetailProfil === itemId && newUnlockedArr.indexOf(itemId) === -1) {
                updates[`members/${memberKey}/hiasanDetailProfil`] = 'default';
            }

            const newMarketRef = marketplaceRef.push();
            updates[`marketplace/${newMarketRef.key}`] = {
                itemId: itemId,
                tipe: tipeKey === 'nama' ? 'Hiasan Nama' : tipeKey === 'profil' ? 'Hiasan Profil' : 'Hiasan Detail Profil',
                harga: harga,
                stok: stok,
                sellerKey: memberKey,
                sellerName: member.nama || 'Member',
                createdAt: Date.now()
            };

            closeModal('sellItemModal');
            alert(`Hiasan berhasil dipasang di Marketplace sebanyak ${stok} stok!`);
            database.ref().update(updates).catch(err => alert('Gagal memasang item: ' + (err.message || 'coba lagi')));
        }

                function editMarketplacePrice(marketKey) {
            if (!activeLoggedInMemberKey) { showResultPopup('Login dulu untuk mengedit penjualan.'); return; }
            const item = globalMarketplaceData[marketKey];
            if (!item) return;
            if (item.sellerKey !== activeLoggedInMemberKey) { showResultPopup('Hanya penjual item ini yang dapat mengedit.'); return; }
            document.getElementById('marketplaceEditKey').value = marketKey;
            document.getElementById('marketplaceEditPrice').value = Math.max(1, Number(item.harga || 1));
            document.getElementById('marketplaceEditStock').value = Math.max(1, Number(item.stok || 1));
            openModal('marketplaceEditModal');
        }

        async function saveMarketplaceEdit() {
            const key = document.getElementById('marketplaceEditKey').value;
            const item = globalMarketplaceData[key];
            if (!item || !activeLoggedInMemberKey || item.sellerKey !== activeLoggedInMemberKey) {
                showResultPopup('Hanya penjual item ini yang dapat mengedit.'); return;
            }
            const harga = Math.floor(Number(document.getElementById('marketplaceEditPrice').value || 0));
            const stok = Math.floor(Number(document.getElementById('marketplaceEditStock').value || 0));
            if (!Number.isFinite(harga) || harga < 1) { showResultPopup('Harga minimal 1 Diamond.'); return; }
            if (!Number.isFinite(stok) || stok < 1) { showResultPopup('Stok minimal 1 item.'); return; }
            const oldStock = Math.max(0, Math.floor(Number(item.stok || 0)));
            const delta = stok - oldStock;
            const memberKey = activeLoggedInMemberKey;
            const member = globalMembersData[memberKey] || {};
            const field = item.tipe === 'Hiasan Nama' ? 'unlockedHiasan' : item.tipe === 'Hiasan Profil' ? 'unlockedHiasanProfil' : 'unlockedHiasanDetailProfil';
            const updates = { [`marketplace/${key}/harga`]: harga, [`marketplace/${key}/stok`]: stok };
            if (delta > 0) {
                const unlocked = getItemArray(member[field]);
                const availableCount = unlocked.filter(id => id === item.itemId && isItemAvailable(member, id)).length;
                if (availableCount - delta < 1) {
                    showResultPopup(`Item tidak cukup untuk menambah stok. Kamu memiliki ${availableCount} item tersisa dan harus menyisakan minimal 1.`);
                    return;
                }
                let toRemove = delta;
                const nextUnlocked = unlocked.filter(id => {
                    if (id !== item.itemId || toRemove <= 0) return true;
                    toRemove--;
                    return false;
                });
                updates[`members/${memberKey}/${field}`] = nextUnlocked;
            } else if (delta < 0) {
                const unlocked = getItemArray(member[field]);
                for (let i = 0; i < Math.abs(delta); i++) unlocked.push(item.itemId);
                updates[`members/${memberKey}/${field}`] = unlocked;
            }
            try {
                await database.ref().update(updates);
                closeModal('marketplaceEditModal');
                showResultPopup('Penjualan berhasil diperbarui!');
            } catch (e) { showResultPopup('Gagal memperbarui penjualan. Coba lagi.'); }
        }

        function buyMarketplaceItem(marketKey) {
            if (!activeLoggedInMemberKey) {
                alert("Silakan login terlebih dahulu di tab Personalisasi sebelum membeli di marketplace!");
                switchTab('personal');
                return;
            }
            const marketItem = globalMarketplaceData[marketKey];
            if (!marketItem) return;
            if (marketItem.sellerKey === activeLoggedInMemberKey) {
                alert("Kamu tidak bisa membeli item yang kamu jual sendiri!");
                return;
            }
            const buyer = globalMembersData[activeLoggedInMemberKey];
            if (!buyer) return;
            const price = Number(marketItem.harga || 0);
            const stock = Math.floor(Number(marketItem.stok || 0));
            if (stock < 1) { marketplaceRef.child(marketKey).remove(); alert("Stok item sudah habis."); return; }
            if (Number(buyer.diamond || 0) < price) { alert("Diamond kamu tidak cukup!"); return; }
            const itemName = hiasanNamaMap[marketItem.itemId] || hiasanProfilMap[marketItem.itemId] || hiasanDetailProfilMap[marketItem.itemId] || marketItem.itemId || 'Item';
            openPurchaseConfirmation({
                name: itemName,
                type: marketItem.tipe || 'Hiasan',
                description: `Item dari ${marketItem.sellerName || 'Member'} di Marketplace. Stok tersedia: ${stock}. Item akan masuk ke Inventory setelah pembayaran berhasil.`,
                price
            }, () => processMarketplacePurchase(marketKey));
        }

        async function processMarketplacePurchase(marketKey) {
            const marketItem = globalMarketplaceData[marketKey];
            const buyerKey = activeLoggedInMemberKey;
            const buyer = buyerKey && globalMembersData[buyerKey];
            if (!marketItem || !buyer) return;
            if (marketItem.sellerKey === buyerKey) { alert("Kamu tidak bisa membeli item yang kamu jual sendiri!"); return; }
            const price = Number(marketItem.harga || 0);
            const stock = Math.floor(Number(marketItem.stok || 0));
            const buyerDiamond = Number(buyer.diamond || 0);
            if (stock < 1) { marketplaceRef.child(marketKey).remove(); alert("Stok item sudah habis."); return; }
            if (buyerDiamond < price) { alert("Diamond kamu tidak cukup!"); return; }

            const sellerKey = marketItem.sellerKey;
            const seller = globalMembersData[sellerKey] || {};
            const updates = {};
            updates[`members/${buyerKey}/diamond`] = buyerDiamond - price;
            if (globalMembersData[sellerKey]) updates[`members/${sellerKey}/diamond`] = Number(seller.diamond || 0) + price;
            const type = marketItem.tipe;
            const field = type === 'Hiasan Nama' ? 'unlockedHiasan' : type === 'Hiasan Profil' ? 'unlockedHiasanProfil' : 'unlockedHiasanDetailProfil';
            const buyerUnlocked = getItemArray(buyer[field]);
            buyerUnlocked.push(marketItem.itemId);
            updates[`members/${buyerKey}/${field}`] = buyerUnlocked;
            if (stock <= 1) updates[`marketplace/${marketKey}`] = null;
            else updates[`marketplace/${marketKey}/stok`] = stock - 1;

            try {
                await database.ref().update(updates);
                buyer.diamond = buyerDiamond - price;
                if (globalMembersData[sellerKey]) seller.diamond = Number(seller.diamond || 0) + price;
                refreshMarketplaceDiamond();
                updateShopDiamondDisplay();
                renderMarketplace();
                alert("Berhasil membeli 1 item dari Marketplace!");
            } catch (err) {
                console.error('Pembelian Marketplace gagal:', err);
                alert('Pembelian gagal: ' + (err.message || 'coba lagi'));
            }
        }
