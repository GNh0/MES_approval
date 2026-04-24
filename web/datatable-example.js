window.ApprovalDataTableExample = [
    {
        ORGDIV: '01',
        PURNUM: 'P20260414002',
        PURSEQ: 1,
        ITEMCD: 'KNG353HS-BK(9403)',
        ITEMNM: 'KNG353HS-BK(9403)',
        QTY: 3600,
        QTYUNIT: 'KG',
        UNP: 3800,
        AMT: 13680000,
        WONAMT: 13680000,
        TAXAMT: 1368000,
        TOTAMT: 15048000,
        PURPOSE: '사출 원재료(본사)',
        LVL1NM: '원재료',
        FINYN: 'Y',
        REQDT2: '2026-04-14',
        REGDT: '2026-04-14 08:16:34.697',
        REGEMPNO: '20021801',
        REGEMPNM: '김진현'
    },
    {
        ORGDIV: '01',
        PURNUM: 'P20260414002',
        PURSEQ: 2,
        ITEMCD: 'KNG353HI-BK(9403)',
        ITEMNM: 'KNG353HI-BK(9403)',
        QTY: 1200,
        QTYUNIT: 'KG',
        UNP: 3400,
        AMT: 4080000,
        WONAMT: 4080000,
        TAXAMT: 408000,
        TOTAMT: 4488000,
        PURPOSE: '사출 원재료(본사)',
        LVL1NM: '원재료',
        FINYN: 'Y',
        REQDT2: '2026-04-14',
        REGDT: '2026-04-14 08:16:34.697',
        REGEMPNO: '20021801',
        REGEMPNM: '김진현'
    },
    {
        ORGDIV: '01',
        PURNUM: 'P20260414002',
        PURSEQ: 3,
        ITEMCD: 'KNG308-GY(9855)',
        ITEMNM: 'KNG308-GY(9855)',
        QTY: 1000,
        QTYUNIT: 'KG',
        UNP: 9120,
        AMT: 9120000,
        WONAMT: 9120000,
        TAXAMT: 912000,
        TOTAMT: 10032000,
        PURPOSE: '사출 원재료(본사)',
        LVL1NM: '원재료',
        FINYN: 'Y',
        REQDT2: '2026-04-14',
        REGDT: '2026-04-14 08:16:34.697',
        REGEMPNO: '20021801',
        REGEMPNM: '김진현'
    },
    {
        ORGDIV: '01',
        PURNUM: 'P20260414002',
        PURSEQ: 4,
        ITEMCD: 'RG33HI-BK(가공)',
        ITEMNM: 'RG33HI-BK(가공)',
        QTY: 1800,
        QTYUNIT: 'KG',
        UNP: 2800,
        AMT: 5040000,
        WONAMT: 5040000,
        TAXAMT: 504000,
        TOTAMT: 5544000,
        PURPOSE: '사출 원재료(본사)',
        LVL1NM: '원재료',
        FINYN: 'Y',
        REQDT2: '2026-04-14',
        REGDT: '2026-04-14 08:16:34.697',
        REGEMPNO: '20021801',
        REGEMPNM: '김진현'
    }
];

window.loadDataTableExample = function () {
    window.setApprovalData(window.ApprovalDataTableExample);
};

window.loadWrappedDataTableExample = function () {
    window.setApprovalData({
        title: '발주서',
        subject: '[발주서] P20260414002',
        writerName: '김진현',
        deptName: '구매팀',
        receiverText: '구매팀, 자재팀',
        form: {
            formType: 'TEMPLATE',
            templateUrl: './templates/purchase-order.html'
        },
        tables: {
            detail: window.ApprovalDataTableExample
        }
    });
};
