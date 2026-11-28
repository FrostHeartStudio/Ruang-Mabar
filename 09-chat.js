// Ruang Mabar module: 09-chat.js
// Keep this file loaded in the order declared in index.html.
                // RENDER CHAT
        // Keep cards keyed by Firebase push key; unchanged cards are reused on each update.
        let chatDecorationObserver = null;

        function observeChatDecorationCard(card) {
            if (!card || card.dataset.decorationObserved === '1') return;
            if ('IntersectionObserver' in window) {
                if (!chatDecorationObserver) {
                    chatDecorationObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const card = entry.target;
                            card.classList.toggle('chat-decoration-paused', !entry.isIntersecting);
                            if (entry.isIntersecting && card.dataset.effectsApplied !== '1') {
                                applyNewProfileDecorationEffects(card, card.dataset.decorationId || '');
                                card.dataset.effectsApplied = '1';
                            }
                        });
                    }, { root: null, rootMargin: '120px 0px', threshold: 0.01 });
                }
                chatDecorationObserver.observe(card);
                card.dataset.decorationObserved = '1';
            } else {
                applyNewProfileDecorationEffects(card, card.dataset.decorationId || '');
                card.dataset.effectsApplied = '1';
            }
        }

        function createChatCard(key, chat, signature) {
            let decorClass = 'card-box';
            if (chat.hiasanProfil === 'vip_plus_gold') decorClass += ' decor-vip-plus-gold';
            else if (chat.hiasanProfil === 'kuning_border_ijo') decorClass += ' decor-yellow';
            else if (chat.hiasanProfil === 'biru_bercahaya') decorClass += ' decor-biru-bercahaya';
            else if (chat.hiasanProfil === 'hitam_ornamen') decorClass += ' decor-hitam-ornamen';
            else if (chat.hiasanProfil === 'hijau_ornamen') decorClass += ' decor-hijau-ornamen';
            else if (chat.hiasanProfil === 'crystal_ungu') decorClass += ' decor-crystal-ungu';
            else if (chat.hiasanProfil === 'aurora_cerah') decorClass += ' decor-aurora-cerah';
            else if (chat.hiasanProfil === 'sakura_bersemi') decorClass += ' decor-sakura-bersemi';
            else if (chat.hiasanProfil === 'api_naga') decorClass += ' decor-api-naga';
            else if (chat.hiasanProfil === 'petir_neon') decorClass += ' decor-petir-neon';
            else if (chat.hiasanProfil === 'emerald_venom') decorClass += ' decor-emerald-venom';
            else if (chat.hiasanProfil === 'debu_kosmik') decorClass += ' decor-debu-kosmik';
            else if (chat.hiasanProfil === 'phoenix_ember') decorClass += ' decor-phoenix-ember';
            else if (chat.hiasanProfil === 'neon_matrix') decorClass += ' decor-neon-matrix';
            else if (chat.hiasanProfil === 'frost_relic') decorClass += ' decor-frost-relic';
            else if (chat.hiasanProfil === 'desert_mirage') decorClass += ' decor-desert-mirage';
            else if (chat.hiasanProfil === 'deep_space') decorClass += ' decor-deep-space';

            const chatCard = document.createElement('div');
            chatCard.className = decorClass + ' chat-list-card';
            chatCard.dataset.chatKey = key;
            chatCard.dataset.chatSignature = signature;
            chatCard.dataset.decorationId = chat.hiasanProfil || '';
            chatCard.style.cssText = 'margin-bottom: 12px; padding: 14px 18px; position: relative; border-radius: 18px 18px 18px 6px;';

            const time = chat.timestamp ? new Date(chat.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + new Date(chat.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
            let nameClass = 'member-name';
            if (chat.hiasanNama === 'vip_plus_gold') nameClass = 'member-name name-vip-plus-gold';
            else if (chat.hiasanNama === 'vip_gold') nameClass = 'member-name name-gold-shiny';
            else if (chat.hiasanNama === 'limited_shiny') nameClass = 'member-name name-green-shiny';
            else if (chat.hiasanNama === 'spesial_ungu') nameClass = 'member-name name-purple-shiny';
            else if (chat.hiasanNama === 'keberuntungan') nameClass = 'member-name name-red-shiny';
            else if (chat.hiasanNama === 'terpilih') nameClass = 'member-name name-diamond-shiny';
            else if (hiasanNamaClassMap[chat.hiasanNama]) nameClass = 'member-name ' + hiasanNamaClassMap[chat.hiasanNama];

            const gelar = chat.gelar || '';
            const isGelarVipPlus = gelar && gelar.toLowerCase().includes('vip plus');
            const isGelarVip = gelar && gelar.toLowerCase().includes('vip');
            const gelarClass = isGelarVipPlus ? 'member-gelar vip-plus' : (isGelarVip ? 'member-gelar vip' : 'member-gelar');
            const gelarHTML = (gelar && gelar !== '-') ? `<span class="${gelarClass}" style="font-size:0.7rem; padding:1px 8px;">${escapeHTML(gelar)}</span>` : '';
            const senderName = chat.sender || chat.nama || chat.username || 'Member';

            const canDeleteOwnMessage = !!activeLoggedInMemberKey && chat.senderKey === activeLoggedInMemberKey;
            chatCard.innerHTML = `
                ${canDeleteOwnMessage ? `<button type="button" class="chat-message-delete" onclick="deleteOwnChatMessage('${key}')" aria-label="Hapus pesan ini untuk semua member" title="Hapus pesan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg></button>` : ''}
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; padding-right:${canDeleteOwnMessage ? '28px' : '0'};">
                    ${renderPlayerNameWithBox(chat, nameClass, senderName, 'font-size:1.05rem;')}
                    ${gelarHTML}
                </div>
                <div class="chat-message-text" style="font-size: 0.95rem; word-break: break-word; margin-bottom: 18px;">
                    ${escapeHTML(chat.text || '')}
                </div>
                <div style="position: absolute; bottom: 8px; right: 14px; font-size: 0.72rem; color: #64748b; font-weight: 600;">
                    ${time}
                </div>
            `;
            return chatCard;
        }

        function renderChats() {
            const chatList = document.getElementById('chat-list');
            if (!chatList) return;
            const chatData = globalChatsData && typeof globalChatsData === 'object' ? globalChatsData : {};
            const sortedKeys = Object.keys(chatData).sort((a, b) => {
                return (chatData[b].timestamp || 0) - (chatData[a].timestamp || 0);
            });
            const existingCards = new Map(Array.from(chatList.children).map(card => [card.dataset.chatKey, card]));
            const retainedKeys = new Set();

            sortedKeys.forEach((key, index) => {
                const chat = chatData[key] || {};
                const signature = JSON.stringify({ ...chat, _viewer: activeLoggedInMemberKey || '' });
                let card = existingCards.get(key);
                if (!card || card.dataset.chatSignature !== signature) {
                    if (card) {
                        if (chatDecorationObserver) chatDecorationObserver.unobserve(card);
                        card.remove();
                    }
                    card = createChatCard(key, chat, signature);
                }
                retainedKeys.add(key);
                const currentAtIndex = chatList.children[index] || null;
                if (currentAtIndex !== card) chatList.insertBefore(card, currentAtIndex);
                observeChatDecorationCard(card);
            });

            existingCards.forEach((card, key) => {
                if (!retainedKeys.has(key)) {
                    if (chatDecorationObserver) chatDecorationObserver.unobserve(card);
                    card.remove();
                }
            });
        }

        function playUiSound(type = 'click') {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = window.__ruangMabarAudioCtx || (window.__ruangMabarAudioCtx = new AudioCtx());
                if (ctx.state === 'suspended') ctx.resume();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                const now = ctx.currentTime;
                const freq = type === 'buy' ? 720 : (type === 'chat' ? 560 : (type === 'wheel' ? 330 : 620));
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(freq * (type === 'wheel' ? 1.8 : 1.15), now + (type === 'wheel' ? 0.12 : 0.07));
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'wheel' ? 0.16 : 0.09));
                osc.start(now); osc.stop(now + (type === 'wheel' ? 0.17 : 0.1));
            } catch (e) {}
        }

        renderQuestUI();

        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            if (target.closest('#adminModal')) return;
            if (target.closest('input, select, textarea')) return;
            if (target.id === 'spinWheelButton' || target.classList.contains('btn-buy')) return;
            if (target.getAttribute('onclick') && /sendChatMessage|buyShopItem|spinWheel/i.test(target.getAttribute('onclick'))) return;
            playUiSound('click');
        });

        function getChatDeleteDialog() {
            let dialog = document.getElementById('chat-delete-confirm-dialog');
            if (dialog) return dialog;

            dialog = document.createElement('dialog');
            dialog.id = 'chat-delete-confirm-dialog';
            dialog.className = 'chat-delete-confirm-dialog';
            dialog.setAttribute('aria-labelledby', 'chat-delete-confirm-title');
            dialog.setAttribute('closedby', 'closerequest');
            dialog.innerHTML = `
                <h3 id="chat-delete-confirm-title">Hapus pesan?</h3>
                <p>Pesan ini akan dihapus secara permanen untuk semua member.</p>
                <form method="dialog" class="chat-delete-confirm-actions">
                    <button type="submit" value="cancel" class="chat-delete-cancel" autofocus>Batal</button>
                    <button type="submit" value="delete" class="chat-delete-accept">Hapus</button>
                </form>`;
            document.body.appendChild(dialog);
            dialog.addEventListener('close', () => {
                const result = dialog.returnValue;
                dialog.returnValue = '';
                const chatKey = dialog.dataset.chatKey;
                dialog.dataset.chatKey = '';
                if (result !== 'delete' || !chatKey) return;
                const currentChat = globalChatsData && globalChatsData[chatKey];
                if (!activeLoggedInMemberKey || !currentChat || currentChat.senderKey !== activeLoggedInMemberKey) return;
                chatsRef.child(chatKey).remove()
                    .catch(error => alert('Pesan gagal dihapus: ' + (error.message || 'Terjadi kesalahan.')));
            });
            return dialog;
        }

        function deleteOwnChatMessage(chatKey) {
            if (!activeLoggedInMemberKey || !chatKey || !globalChatsData || !globalChatsData[chatKey]) return;
            const chat = globalChatsData[chatKey];
            if (chat.senderKey !== activeLoggedInMemberKey) {
                alert('Kamu hanya bisa menghapus pesan milikmu sendiri.');
                return;
            }
            const dialog = getChatDeleteDialog();
            dialog.dataset.chatKey = chatKey;
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
            } else if (window.confirm('Hapus pesan ini secara permanen untuk semua member?')) {
                dialog.dataset.chatKey = '';
                chatsRef.child(chatKey).remove()
                    .catch(error => alert('Pesan gagal dihapus: ' + (error.message || 'Terjadi kesalahan.')));
            } else {
                dialog.dataset.chatKey = '';
            }
        }


        const chatMessageInput = document.getElementById('inputChatMessage');
        if (chatMessageInput) {
            chatMessageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') chatMessageInput.blur();
            });
        }

        function sendChatMessage() {
            playUiSound('chat');
            if (!activeLoggedInMemberKey) {
                alert("Silakan login terlebih dahulu di tab Personalisasi untuk bisa mengirim chat!");
                switchTab('personal');
                return;
            }

            const textInput = document.getElementById('inputChatMessage');
            const text = textInput.value.trim();
            if (!text) return;

            const member = globalMembersData[activeLoggedInMemberKey];
            if (!member) return;

            const newChatRef = chatsRef.push();
            newChatRef.set({
                sender: member.nama || 'Member',
                senderKey: activeLoggedInMemberKey,
                gelar: member.gelar || '-',
                hiasanNama: member.hiasanNama || 'default',
                kotakNama: member.kotakNama || 'default',
                hiasanProfil: member.hiasanProfil || 'default',
                text: text,
                timestamp: Date.now()
            }).then(() => {
                textInput.value = '';
                recordQuestChat();
            });
        }
