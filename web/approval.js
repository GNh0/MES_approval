(function () {
    var currentTab = 'edit';
    var editorReady = false;
    var pendingBodyHtml = '';

    var sample = {
        title: '발주서',
        numberRule: '기본채번',
        writeDate: '2026-04-24',
        writeHour: '09',
        writeMinute: '32',
        deptName: '시스템구축',
        writerName: '관리자',
        receiverText: '',
        executorText: '',
        executeDate: '',
        subject: '[발주서] 제일금속_20260331',
        templateData: {
            PURNUM: 'P20260416003',
            CUSTNM: '제일금속',
            CUSTADDR: '',
            MANAGER: '',
            TEL: '',
            DETAIL_ROWS: [
                { SEQ: 1, GUBUN: '구매품', ITEMNM: 'SLN G70', SPEC: 'SLN G70', USE: '', DLVDT: '26.03.31', QTY: 500, UNIT: 'EA', UNP: 960 }
            ]
        },
        approvalLines: [
            { type: 'APPROVAL', role: '기안', userName: '관리자', status: 'APPROVED', statusName: '승인' },
            { type: 'APPROVAL', role: '검토', userName: '김대리', status: 'READY', statusName: '대기' },
            { type: 'APPROVAL', role: '승인', userName: '이과장', status: 'WAIT', statusName: '' },
            { type: 'APPROVAL', role: '승인', userName: '박부장', status: 'WAIT', statusName: '' },
            { type: 'APPROVAL', role: '승인', userName: '', status: 'WAIT', statusName: '' },
            { type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' },
            { type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' },
            { type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' },
            { type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' },
            { type: 'AGREEMENT', role: '합의', userName: '', status: 'WAIT', statusName: '' }
        ],
        templateHtml:
            '<div class="body-inner">' +
            '<p class="center">아래와 같이 발주하고자 하오니 검토 후 재가 바랍니다.</p>' +
            '<div class="gap"></div>' +
            '<p class="center">- 아 래 -</p>' +
            '<div class="section-title">1. 발주정보</div>' +
            '<table class="body-table" style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
            '<thead><tr><th style="width:20%;">발주번호</th><th style="width:20%;">외주처</th><th style="width:20%;">주소</th><th style="width:20%;">담당자</th><th style="width:20%;">연락처</th></tr></thead>' +
            '<tbody><tr><td>{{PURNUM}}</td><td>{{CUSTNM}}</td><td>{{CUSTADDR}}</td><td>{{MANAGER}}</td><td>{{TEL}}</td></tr></tbody>' +
            '</table>' +
            '<div class="section-title">2. 상세내역</div>' +
            '<table class="body-table" data-calc-table="purchaseDetail" style="width:100%;border-collapse:collapse;table-layout:fixed;">' +
            '<thead><tr><th style="width:45px;">순번</th><th style="width:70px;">구분</th><th style="width:90px;">품명</th><th style="width:90px;">규격</th><th style="width:70px;">용도</th><th style="width:70px;">납기일</th><th style="width:55px;">수량</th><th style="width:45px;">단위</th><th style="width:55px;">단가</th><th style="width:70px;">공급액</th><th style="width:70px;">부가세</th><th style="width:70px;">합계액</th></tr></thead>' +
            '<tbody>{{DETAIL_ROWS}}</tbody>' +
            '</table>' +
            '</div>'
    };

    sample.bodyHtml = renderTemplate(sample.templateHtml, sample.templateData);

    var app = {
        model: {},

        init: function () {
            this.initEditor();
            this.bindModalEvents();
            this.setApprovalData(sample);
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
                    'th[class|style|colspan|rowspan|data-col|data-field|data-formula|data-calc]',
                    'td[class|style|colspan|rowspan|data-col|data-field|data-formula|data-calc]'
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
                    editor.ui.registry.addButton('calcapproval', {
                        text: '계산',
                        tooltip: 'data-formula 자동계산',
                        onAction: function () { app.applyCalculation(); }
                    });
                    editor.on('init', function () {
                        editorReady = true;
                        editor.setContent(pendingBodyHtml || '');
                        app.applyCalculation();
                    });
                }
            });
        },

        bindModalEvents: function () {
            byId('lineModalCancel').onclick = function () { app.closeLineEditor(); };
            byId('lineModalApply').onclick = function () { app.applyLineEditor(); };
        },

        setApprovalData: function (data) {
            this.model = data || {};
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
            this.renderApprovalLines();
            pendingBodyHtml = this.model.bodyHtml || '';
            if (editorReady) getEditor().setContent(pendingBodyHtml);
            byId('htmlCode').value = pendingBodyHtml;
            this.refreshPreview();
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
                this.applyCalculation();
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

        refreshPreview: function () {
            byId('previewContent').innerHTML = this.getBodyHtml();
        },

        applyTemplate: function () {
            var html = renderTemplate(this.model.templateHtml || sample.templateHtml, this.model.templateData || sample.templateData);
            this.setBodyHtml(html);
            byId('htmlCode').value = html;
            this.applyCalculation();
        },

        applyCalculation: function () {
            var html = this.getBodyHtml();
            var box = document.createElement('div');
            box.innerHTML = html;
            calculateTables(box);
            this.setBodyHtml(box.innerHTML);
            byId('htmlCode').value = box.innerHTML;
            if (currentTab === 'preview') byId('previewContent').innerHTML = box.innerHTML;
        },

        collect: function () {
            if (currentTab === 'html') this.setBodyHtml(byId('htmlCode').value || '');
            this.applyCalculation();
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
                lines.push({
                    type: row.querySelector('[data-k="type"]').value,
                    role: row.querySelector('[data-k="role"]').value,
                    userName: row.querySelector('[data-k="userName"]').value,
                    status: 'WAIT',
                    statusName: ''
                });
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
            if (next) {
                next.status = 'READY';
                next.statusName = '대기';
            }
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
    window.setApprovalData = function (data) { if (typeof data === 'string') data = JSON.parse(data); app.setApprovalData(data); };
    window.getApprovalData = function () { return app.collect(); };

    function renderTemplate(template, data) {
        var result = template || '';
        data = data || {};
        Object.keys(data).forEach(function (key) {
            if (key === 'DETAIL_ROWS') return;
            result = result.split('{{' + key + '}}').join(enc(data[key]));
        });
        result = result.split('{{DETAIL_ROWS}}').join(renderDetailRows(data.DETAIL_ROWS || []));
        return result;
    }

    function renderDetailRows(rows) {
        return rows.map(function (x) {
            return '<tr data-row-calc="purchase">' +
                '<td data-col="seq">' + enc(x.SEQ) + '</td>' +
                '<td data-col="gubun">' + enc(x.GUBUN) + '</td>' +
                '<td data-col="itemnm">' + enc(x.ITEMNM) + '</td>' +
                '<td data-col="spec">' + enc(x.SPEC) + '</td>' +
                '<td data-col="use">' + enc(x.USE) + '</td>' +
                '<td data-col="dlvdt">' + enc(x.DLVDT) + '</td>' +
                '<td data-col="qty">' + formatNumber(x.QTY) + '</td>' +
                '<td data-col="unit">' + enc(x.UNIT) + '</td>' +
                '<td data-col="unp">' + formatNumber(x.UNP) + '</td>' +
                '<td data-col="supply" data-formula="qty * unp"></td>' +
                '<td data-col="vat" data-formula="supply * 0.1"></td>' +
                '<td data-col="total" data-formula="supply + vat"></td>' +
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
                var formula = cell.getAttribute('data-formula');
                var result = safeFormula(formula, values);
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

    function toNumber(value) { return Number(String(value || '').replace(/,/g, '').trim()) || 0; }
    function formatNumber(value) { return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function getEditor() { return window.tinymce ? tinymce.get('bodyEditor') : null; }
    function toggleTab(name, activeName) { byId('tab' + cap(name)).classList.toggle('active', name === activeName); byId('panel' + cap(name)).classList.toggle('active', name === activeName); }
    function findReadyLine(lines) { return lines.filter(function (x) { return x.status === 'READY'; })[0]; }
    function findNextWaitLine(lines) { return lines.filter(function (x) { return x.status === 'WAIT' && x.userName; })[0]; }
    function byId(id) { return document.getElementById(id); }
    function cap(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
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
