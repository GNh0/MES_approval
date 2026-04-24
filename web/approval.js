(function () {
    var currentTab = 'edit';
    var editorReady = false;
    var pendingBodyHtml = '';

    function createDefaultLines() {
        var lines = [];
        for (var i = 0; i < 5; i++) lines.push({ type: 'APPROVAL', role: i === 0 ? '기안' : '', userName: '', status: 'WAIT', statusName: '' });
        for (var j = 0; j < 5; j++) lines.push({ type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' });
        return lines;
    }

    function createBlankDocument() {
        var now = new Date();
        return {
            title: '기안서',
            numberRule: '기본채번',
            writeDate: formatDate(now),
            writeHour: pad2(now.getHours()),
            writeMinute: pad2(now.getMinutes()),
            deptName: '',
            writerName: '',
            receiverText: '',
            executorText: '',
            executeDate: '',
            subject: '',
            form: { formId: '', formName: '', formType: 'BASIC', templateUrl: '', templateHtml: '' },
            businessData: {},
            tables: {},
            approvalLines: createDefaultLines(),
            bodyHtml: ''
        };
    }

    var app = {
        model: createBlankDocument(),

        init: function () {
            this.initEditor();
            this.bindModalEvents();
            this.setApprovalData(createBlankDocument());
        },

        initEditor: function () {
            if (!window.tinymce) {
                byId('bodyEditor').style.display = 'none';
                byId('editorLoadError').style.display = 'block';
                return;
            }

            tinymce.init({
                selector: '#bodyEditor',
                height: 650,
                menubar: 'file edit view insert format table tools help',
                branding: false,
                promotion: false,
                license_key: 'gpl',
                language: 'ko_KR',
                language_url: 'https://cdn.jsdelivr.net/npm/tinymce-i18n@24.10.7/langs7/ko_KR.js',
                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
                toolbar: [
                    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
                    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table link image media | code preview fullscreen | calcapproval'
                ].join(' | '),
                table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | cellprops cellsplit cellmerge',
                table_resize_bars: true,
                table_sizing_mode: 'fixed',
                resize: false,
                extended_valid_elements: [
                    'table[class|style|border|cellpadding|cellspacing|data-calc-table]',
                    'tr[class|style|data-row-calc]',
                    'th[class|style|colspan|rowspan|data-col|data-field|data-formula|data-calc|data-dze-formula|dze_format_separator|title]',
                    'td[class|style|colspan|rowspan|data-col|data-field|data-formula|data-calc|data-dze-formula|dze_format_separator|title]'
                ].join(','),
                content_style: [
                    "body { font-family:'Malgun Gothic','맑은 고딕',Arial,sans-serif; font-size:13px; line-height:1.65; }",
                    '.body-inner { font-size:13px; }',
                    '.center { text-align:center; }',
                    '.gap { height:22px; }',
                    '.section-title { margin:26px 0 7px; font-size:14px; font-weight:700; }',
                    '.body-table th, .body-table td { border:1px solid #000; height:32px; padding:5px 6px; text-align:center; vertical-align:middle; min-width:48px; }',
                    '.body-table th { background:#d9d9d9; font-weight:700; }'
                ].join('\n'),
                setup: function (editor) {
                    editor.ui.registry.addButton('calcapproval', { text: '계산', tooltip: '자동계산', onAction: function () { app.applyCalculation(); } });
                    editor.on('init', function () {
                        editorReady = true;
                        editor.setContent(pendingBodyHtml || '');
                    });
                }
            });
        },

        bindModalEvents: function () {
            byId('lineModalCancel').onclick = function () { app.closeLineEditor(); };
            byId('lineModalApply').onclick = function () { app.applyLineEditor(); };
        },

        resetBlank: function () { this.setApprovalData(createBlankDocument()); },

        loadDemoData: function () {
            if (!window.ApprovalDemoData) return alert('demo-data.js가 로드되지 않았습니다.');
            this.setApprovalData(window.ApprovalDemoData);
        },

        setApprovalData: async function (data) {
            var base = createBlankDocument();
            this.model = normalizeModel(merge(base, data || {}));

            var bodyHtml = this.model.bodyHtml || '';
            if (!bodyHtml && isTemplateForm(this.model)) {
                bodyHtml = await this.renderModelTemplate();
                this.model.bodyHtml = bodyHtml;
            }

            this.bindDocumentFields();
            this.renderApprovalLines();
            this.setBodyHtml(bodyHtml);
            byId('htmlCode').value = bodyHtml;
            this.refreshPreview();
        },

        bindDocumentFields: function () {
            setText('docTitle', this.model.title || '기안서');
            setSelectValue('numberRule', this.model.numberRule || '기본채번');
            setValue('writeDate', this.model.writeDate);
            setSelectValue('writeHour', this.model.writeHour);
            setSelectValue('writeMinute', this.model.writeMinute);
            setSelectValue('deptName', this.model.deptName);
            setText('writerName', this.model.writerName);
            setValue('receiverText', this.model.receiverText);
            setValue('executorText', this.model.executorText);
            setValue('executeDate', this.model.executeDate);
            setValue('subject', this.model.subject);
        },

        renderApprovalLines: function () {
            var lines = this.model.approvalLines || [];
            byId('approvalGroup').innerHTML = renderLineTable(lines.filter(function (x) { return x.type === 'APPROVAL'; }), 5);
            byId('agreementGroup').innerHTML = renderLineTable(lines.filter(function (x) { return x.type === 'AGREEMENT'; }), 5);
        },

        changeBodyTab: function (tab) {
            if (currentTab === 'edit' && tab === 'html') byId('htmlCode').value = this.getBodyHtml();
            if (currentTab === 'html' && tab !== 'html') this.setBodyHtml(byId('htmlCode').value || '');
            if (tab === 'preview') {
                if (currentTab === 'html') this.setBodyHtml(byId('htmlCode').value || '');
                this.applyCalculation(false);
                this.refreshPreview();
            }
            currentTab = tab;
            toggleTab('edit', tab);
            toggleTab('html', tab);
            toggleTab('preview', tab);
        },

        getBodyHtml: function () {
            if (window.tinymce && editorReady && getEditor()) return getEditor().getContent();
            return pendingBodyHtml || '';
        },

        setBodyHtml: function (html) {
            pendingBodyHtml = html || '';
            if (window.tinymce && editorReady && getEditor()) getEditor().setContent(pendingBodyHtml);
        },

        refreshPreview: function () { byId('previewContent').innerHTML = this.getBodyHtml(); },

        renderModelTemplate: async function () {
            var form = this.model.form || {};
            var template = form.templateHtml || '';
            if (!template && form.templateUrl) template = await loadText(form.templateUrl);
            if (!template) return '';
            return renderTemplate(template, this.model.businessData || {});
        },

        applyTemplate: async function () {
            if (!isTemplateForm(this.model)) return alert('템플릿 양식이 지정되지 않았습니다.');
            var html = await this.renderModelTemplate();
            this.model.bodyHtml = html;
            this.setBodyHtml(html);
            byId('htmlCode').value = html;
            this.applyCalculation(false);
            this.refreshPreview();
        },

        applyCalculation: function (notify) {
            var html = this.getBodyHtml();
            var box = document.createElement('div');
            box.innerHTML = html;
            calculateTables(box);
            this.setBodyHtml(box.innerHTML);
            byId('htmlCode').value = box.innerHTML;
            if (currentTab === 'preview') byId('previewContent').innerHTML = box.innerHTML;
            if (notify !== false) alert('자동계산을 적용했습니다.');
        },

        collect: function () {
            if (currentTab === 'html') this.setBodyHtml(byId('htmlCode').value || '');
            this.applyCalculation(false);
            var data = JSON.parse(JSON.stringify(this.model || {}));
            data.title = byId('docTitle').innerText;
            data.numberRule = byId('numberRule').value;
            data.writeDate = byId('writeDate').value;
            data.writeHour = byId('writeHour').value;
            data.writeMinute = byId('writeMinute').value;
            data.deptName = byId('deptName').value;
            data.writerName = byId('writerName').innerText;
            data.receiverText = byId('receiverText').value;
            data.executorText = byId('executorText').value;
            data.executeDate = byId('executeDate').value;
            data.subject = byId('subject').value;
            data.bodyHtml = this.getBodyHtml();
            return data;
        },

        buildPreviewHtml: function () {
            var data = this.collect();
            var html = '';
            html += '<div class="preview-doc">';
            html += '<h1 class="doc-title">' + enc(data.title || '기안서') + '</h1>';
            html += '<div class="doc-frame">';
            html += '<div class="doc-top">';
            html += '<table class="info-table">';
            html += '<tr><th>품의번호</th><td>' + enc(data.numberRule || '') + '</td></tr>';
            html += '<tr><th>작성일자</th><td>' + enc(data.writeDate || '') + ' ' + enc(data.writeHour || '') + ':' + enc(data.writeMinute || '') + '</td></tr>';
            html += '<tr><th>기안부서</th><td>' + enc(data.deptName || '') + '</td></tr>';
            html += '<tr><th>기안자</th><td>' + enc(data.writerName || '') + '</td></tr>';
            html += '</table>';
            html += '<div class="approval-area"><div class="approval-labels"><div class="approval-label">결재</div><div class="approval-label">합의</div></div>';
            html += '<div class="approval-groups"><div class="approval-group">' + byId('approvalGroup').innerHTML + '</div><div class="approval-group">' + byId('agreementGroup').innerHTML + '</div></div></div>';
            html += '</div>';
            html += '<table class="wide-info-table">';
            html += '<tr><th>수신및참조</th><td>' + enc(data.receiverText || '') + '</td></tr>';
            html += '<tr><th>시행자</th><td>' + enc(data.executorText || '') + '</td></tr>';
            html += '<tr><th>시행일자</th><td>' + enc(data.executeDate || '') + '</td></tr>';
            html += '<tr><th>제목</th><td>' + enc(data.subject || '') + '</td></tr>';
            html += '</table>';
            html += '<div class="editor-wrap"><div class="preview-area"><div class="preview-inner">' + data.bodyHtml + '</div></div></div>';
            html += '</div></div>';
            return html;
        },

        openLineEditor: function () {
            var wrap = byId('lineModalBody');
            wrap.innerHTML = '';
            (this.model.approvalLines || []).forEach(function (line, index) {
                var div = document.createElement('div');
                div.className = 'line-grid';
                div.innerHTML = '<select data-k="type"><option value="APPROVAL">결재</option><option value="AGREEMENT">합의</option></select>' +
                    '<input data-k="role" placeholder="구분" />' +
                    '<input data-k="userName" placeholder="결재자" />';
                div.querySelector('[data-k="type"]').value = line.type || 'APPROVAL';
                div.querySelector('[data-k="role"]').value = line.role || '';
                div.querySelector('[data-k="userName"]').value = line.userName || '';
                div.setAttribute('data-index', index);
                wrap.appendChild(div);
            });
            byId('lineModal').classList.add('show');
        },

        closeLineEditor: function () { byId('lineModal').classList.remove('show'); },

        applyLineEditor: function () {
            var lines = [];
            var rows = byId('lineModalBody').querySelectorAll('.line-grid');
            Array.prototype.forEach.call(rows, function (row) {
                lines.push({ type: row.querySelector('[data-k="type"]').value, role: row.querySelector('[data-k="role"]').value, userName: row.querySelector('[data-k="userName"]').value, status: 'WAIT', statusName: '' });
            });
            this.model.approvalLines = lines;
            this.renderApprovalLines();
            this.closeLineEditor();
        },

        demoApprove: function () {
            var line = findReadyLine(this.model.approvalLines || []);
            if (!line) return alert('결재대기 라인이 없습니다.');
            line.status = 'APPROVED';
            line.statusName = '승인';
            var next = findNextWaitLine(this.model.approvalLines || []);
            if (next) { next.status = 'READY'; next.statusName = '대기'; }
            this.renderApprovalLines();
        },

        send: function (messageType) {
            var payload = this.collect();
            payload.messageType = messageType;
            if (window.chrome && window.chrome.webview) window.chrome.webview.postMessage(payload);
            else { console.log(payload); alert(messageType + ' 요청'); }
        },

        requestPdf: function () {
            var payload = this.collect();
            payload.messageType = 'CREATE_PDF';
            payload.previewHtml = this.buildPreviewHtml();
            if (window.chrome && window.chrome.webview) window.chrome.webview.postMessage(payload);
            else { console.log(payload); alert('CREATE_PDF 요청'); }
        }
    };

    window.approvalApp = app;
    window.setApprovalData = function (data) { if (typeof data === 'string') data = JSON.parse(data); return app.setApprovalData(data); };
    window.getApprovalData = function () { return app.collect(); };

    async function loadText(url) {
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('템플릿을 불러올 수 없습니다: ' + url);
        return await res.text();
    }

    function normalizeModel(model) {
        if (!model) return createBlankDocument();
        model.tables = model.tables || {};
        model.businessData = model.businessData || {};

        var header = getFirst(model.tables.header || model.tables.master || model.tables.HEADER || model.tables.MASTER);
        var detail = model.tables.detail || model.tables.details || model.tables.DETAIL || model.tables.purDetail || model.tables.PURDETAIL || [];

        if (header && !hasAny(model.businessData)) {
            model.businessData = mapPurchaseHeader(header);
        } else if (header) {
            model.businessData = merge(mapPurchaseHeader(header), model.businessData);
        }

        if (detail && detail.length > 0 && !model.businessData.DETAIL_ROWS) {
            model.businessData.DETAIL_ROWS = detail;
        }

        if (!model.title && model.businessData.PURNUM) model.title = '발주서';
        if (!model.subject && model.businessData.PURNUM) model.subject = '[발주서] ' + (model.businessData.CUSTNM || '') + '_' + model.businessData.PURNUM;

        if ((!model.form || !isTemplateForm(model)) && model.businessData.PURNUM) {
            model.form = model.form || {};
            model.form.formType = 'TEMPLATE';
            model.form.templateUrl = model.form.templateUrl || './templates/purchase-order.html';
        }

        return model;
    }

    function mapPurchaseHeader(row) {
        return {
            PURNUM: getVal(row, 'PURNUM'),
            CUSTNM: getVal(row, 'CUSTNM') || getVal(row, 'CUSTCD'),
            CUSTADDR: getVal(row, 'CUSTADDR') || getVal(row, 'ADDR'),
            MANAGER: getVal(row, 'MANAGER') || getVal(row, 'CHARGE'),
            TEL: getVal(row, 'TEL') || getVal(row, 'TELNO')
        };
    }

    function isTemplateForm(model) {
        var form = model.form || {};
        return String(form.formType || '').toUpperCase() === 'TEMPLATE' || !!form.templateUrl || !!form.templateHtml;
    }

    function renderTemplate(template, data) {
        var result = template || '';
        data = data || {};
        Object.keys(data).forEach(function (key) {
            if (Array.isArray(data[key])) return;
            result = result.split('{{' + key + '}}').join(enc(data[key]));
        });
        result = result.split('{{DETAIL_ROWS}}').join(renderDetailRows(data.DETAIL_ROWS || data.detailRows || []));
        return result;
    }

    function renderDetailRows(rows) {
        return rows.map(function (x, i) {
            return '<tr data-row-calc="purchase">' +
                '<td data-col="seq">' + enc(getVal(x, 'PURSEQ') || getVal(x, 'SEQ') || (i + 1)) + '</td>' +
                '<td data-col="gubun">' + enc(getVal(x, 'LVL1NM') || getVal(x, 'GUBUN')) + '</td>' +
                '<td data-col="itemnm">' + enc(getVal(x, 'ITEMNM')) + '</td>' +
                '<td data-col="spec">' + enc(getVal(x, 'DWGNO') || getVal(x, 'SPEC')) + '</td>' +
                '<td data-col="use">' + enc(getVal(x, 'PURPOSE') || getVal(x, 'USE')) + '</td>' +
                '<td data-col="dlvdt">' + enc(formatDateText(getVal(x, 'REQDT2') || getVal(x, 'DLVDT'))) + '</td>' +
                '<td data-col="qty" style="text-align:right;">' + formatNumber(getVal(x, 'QTY')) + '</td>' +
                '<td data-col="unit">' + enc(getVal(x, 'QTYUNIT') || getVal(x, 'UNIT')) + '</td>' +
                '<td data-col="unp" style="text-align:right;">' + formatNumber(getVal(x, 'UNP')) + '</td>' +
                '<td data-col="supply" style="text-align:right;">' + formatNumber(getVal(x, 'AMT')) + '</td>' +
                '<td data-col="vat" style="text-align:right;">' + formatNumber(getVal(x, 'TAXAMT')) + '</td>' +
                '<td data-col="total" style="text-align:right;">' + formatNumber(getVal(x, 'TOTAMT')) + '</td>' +
                '</tr>';
        }).join('');
    }

    function calculateTables(root) {
        root.querySelectorAll('tr[data-row-calc]').forEach(function (row) {
            var values = {};
            row.querySelectorAll('[data-col]').forEach(function (cell) {
                var key = cell.getAttribute('data-col');
                if (!cell.hasAttribute('data-formula')) values[key] = toNumber(cell.textContent);
            });
            row.querySelectorAll('[data-formula]').forEach(function (cell) {
                var key = cell.getAttribute('data-col');
                var result = safeFormula(cell.getAttribute('data-formula'), values);
                values[key] = result;
                cell.textContent = formatNumber(result);
            });
        });
    }

    function safeFormula(formula, values) {
        var expr = String(formula || '').replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function (name) {
            return Object.prototype.hasOwnProperty.call(values, name) ? String(values[name] || 0) : '0';
        });
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return 0;
        try { return Math.round(Function('return (' + expr + ')')()); } catch (e) { return 0; }
    }

    function merge(target, source) {
        Object.keys(source || {}).forEach(function (key) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) target[key] = merge(target[key] || {}, source[key]);
            else target[key] = source[key];
        });
        return target;
    }

    function getFirst(value) { return Array.isArray(value) && value.length > 0 ? value[0] : value; }
    function hasAny(obj) { return obj && Object.keys(obj).length > 0; }
    function getVal(row, key) { return row && Object.prototype.hasOwnProperty.call(row, key) && row[key] != null ? row[key] : ''; }
    function toNumber(value) { return Number(String(value || '').replace(/,/g, '').trim()) || 0; }
    function formatNumber(value) { return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function formatDateText(value) { var s = String(value || ''); return s.length >= 10 ? s.substring(0, 10) : s; }
    function getEditor() { return window.tinymce ? tinymce.get('bodyEditor') : null; }
    function toggleTab(name, activeName) { byId('tab' + cap(name)).classList.toggle('active', name === activeName); byId('panel' + cap(name)).classList.toggle('active', name === activeName); }
    function findReadyLine(lines) { return lines.filter(function (x) { return x.status === 'READY'; })[0]; }
    function findNextWaitLine(lines) { return lines.filter(function (x) { return x.status === 'WAIT' && x.userName; })[0]; }
    function byId(id) { return document.getElementById(id); }
    function cap(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
    function pad2(value) { return String(value).padStart(2, '0'); }
    function formatDate(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
    function setText(id, value) { byId(id).innerText = value || ''; }
    function setValue(id, value) { byId(id).value = value || ''; }
    function setSelectValue(id, value) { var el = byId(id); if (!value) return; var exists = false; for (var i = 0; i < el.options.length; i++) if (el.options[i].value === value || el.options[i].text === value) exists = true; if (!exists) { var opt = document.createElement('option'); opt.value = value; opt.text = value; el.appendChild(opt); } el.value = value; }
    function enc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

    function renderLineTable(lines, maxCount) {
        var list = [];
        for (var i = 0; i < maxCount; i++) list.push(lines[i] || { role: '', userName: '', status: 'WAIT', statusName: '' });
        var html = '<table class="approval-table">';
        html += '<tr>' + list.map(function (x) { return '<th>' + enc(x.role || '') + '</th>'; }).join('') + '</tr>';
        html += '<tr class="stamp-row">' + list.map(function (x) { return '<td>' + renderStamp(x) + '</td>'; }).join('') + '</tr>';
        html += '<tr class="name-row">' + list.map(function (x) { return '<td>' + enc(x.userName || '') + '</td>'; }).join('') + '</tr>';
        html += '</table>';
        return html;
    }

    function renderStamp(line) {
        var status = (line.status || '').toUpperCase();
        if (status === 'APPROVED') {
            if (line.stampBase64) return '<img style="max-width:52px;max-height:52px;" src="data:image/png;base64,' + line.stampBase64 + '" />';
            return '<span class="stamp">' + enc(line.statusName || '승인') + '</span>';
        }
        if (status === 'READY') return '<span class="status-ready">대기</span>';
        if (status === 'REJECTED') return '<span class="stamp reject">반려</span>';
        if (status === 'CLOSED') return '<span class="stamp close">종결</span>';
        return '<span class="status-wait">' + enc(line.statusName || '') + '</span>';
    }

    app.init();
})();
