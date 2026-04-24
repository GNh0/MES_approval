# MES Approval Prototype

.NET Framework 4.7.2 MES 프로젝트에 WebView2로 붙일 전자결재 웹 화면 프로토타입입니다.

## 구성

```text
web/
  approval.html
```

현재 `web/approval.html`은 브라우저/캔버스 테스트를 위해 TinyMCE CDN을 사용합니다.
실제 MES 배포 시에는 TinyMCE를 self-hosted 파일로 포함하고 아래 경로로 변경하는 것을 권장합니다.

```html
<script src="tinymce/tinymce.min.js"></script>
```

## 주요 기능

- 문서형 전자결재 레이아웃
- 결재/합의 박스
- 수신 및 참조, 시행자, 제목 입력
- TinyMCE 기반 BODY 편집
- HTML 코드 탭
- 미리보기 탭
- WebView2 `chrome.webview.postMessage()` 연동 구조

## WebView2 연동 개념

C#에서 데이터 전달:

```csharp
await webView.CoreWebView2.ExecuteScriptAsync($"window.setApprovalData({json});");
```

웹에서 C#으로 메시지 전달:

```javascript
chrome.webview.postMessage(payload);
```

메시지 타입 예시:

```text
SAVE_DRAFT
SUBMIT
APPROVE
REJECT
CLOSE
CREATE_PDF
OPEN_RECEIVER
OPEN_EXECUTOR
```
