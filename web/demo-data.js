window.ApprovalDemoData = {
    title: '발주서',
    numberRule: '기본채번',
    writeDate: '2026-04-24',
    writeHour: '09',
    writeMinute: '32',
    deptName: '시스템구축',
    writerName: '관리자',
    receiverText: '구매팀, 자재팀',
    executorText: '관리자',
    executeDate: '2026-04-24',
    subject: '[발주서] 제일금속_20260331',
    form: {
        formId: 'PO_BASIC',
        formName: '발주서 기본 양식',
        formType: 'TEMPLATE',
        templateUrl: './templates/purchase-order.html'
    },
    businessData: {
        PURNUM: 'P20260416003',
        CUSTNM: '제일금속',
        CUSTADDR: '',
        MANAGER: '',
        TEL: '',
        DETAIL_ROWS: [
            { SEQ: 1, GUBUN: '구매품', ITEMNM: 'SLN G70', SPEC: 'SLN G70', USE: '', DLVDT: '26.03.31', QTY: 500, UNIT: 'EA', UNP: 960 },
            { SEQ: 2, GUBUN: '구매품', ITEMNM: 'BRACKET', SPEC: 'BK-120', USE: '', DLVDT: '26.04.05', QTY: 12, UNIT: 'EA', UNP: 15000 }
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
    ]
};
