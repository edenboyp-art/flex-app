// LIFF ID (ใช้ตัวเดิม)
const LIFF_ID = "2009073203-kPdSUtmr";

// Default/Example JSON (เผื่อคนไม่รู้จะใส่อะไร)
const DEFAULT_FLEX = {
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "Hello, World!",
        "weight": "bold",
        "size": "xl"
      },
      {
        "type": "text",
        "text": "This is a dynamic Flex Message."
      }
    ]
  }
};

async function main() {
  const statusDiv = document.getElementById('status');
  const profileDiv = document.getElementById('profile');
  const inputArea = document.getElementById('jsonInput');
  const sendBtn = document.getElementById('sendBtn');
  const shareBtn = document.getElementById('shareBtn');
  const appUI = document.getElementById('appUI');
  const loadingUI = document.getElementById('loadingUI');

  try {
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // 1. ดึงข้อมูลโปรไฟล์ (Profile)
    const profile = await liff.getProfile();
    // แสดงรูปและชื่อผู้ใช้
    profileDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                <img src="${profile.pictureUrl}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #06C755;">
                <div style="text-align: left;">
                    <div style="font-size: 12px; color: #888;">Sending as:</div>
                    <div style="font-weight: bold; font-size: 16px;">${profile.displayName}</div>
                </div>
            </div>
        `;

    // 2. ตั้งค่า Input เริ่มต้น
    inputArea.value = JSON.stringify(DEFAULT_FLEX, null, 2);

    // 3. ตรวจสอบ Context (เปิดจากไหน)
    const context = liff.getContext();
    const isInClient = context && (context.type === 'utou' || context.type === 'group' || context.type === 'room');

    // ปรับ UI ตาม Context
    if (isInClient) {
      sendBtn.style.display = 'block';
      shareBtn.style.display = 'none';
      statusDiv.innerHTML = '<span style="color: green;">✅ อยู่ในห้องแชท (Ready to Send)</span>';
    } else {
      sendBtn.style.display = 'none';
      shareBtn.style.display = 'block';
      statusDiv.innerHTML = '<span style="color: orange;">🌐 เปิดจาก Browser (Select Friend to Share)</span>';
    }

    // แสดงผลหน้า UI หลัก
    loadingUI.style.display = 'none';
    appUI.style.display = 'block'; // Make sure the container is shown

    // ฟังก์ชันสร้าง Object ข้อความจาก Textarea
    const createMessages = () => {
      const raw = inputArea.value;
      if (!raw.trim()) throw new Error("กรุณาใส่ JSON");
      const flexContent = JSON.parse(raw);

      // Construct message object
      return [
        {
          type: 'flex',
          altText: 'Flex Message',
          contents: flexContent
        }
      ];
    };

    // 4. ฟังก์ชันส่ง (Send) สำหรับการกดปุ่ม
    // ต้องแยก Event Listener ออกมาให้ชัดเจน

    sendBtn.addEventListener('click', async () => {
      try {
        const messages = createMessages();
        // ส่งเข้าแชทปัจจุบัน
        await liff.sendMessages(messages);
        alert(`ส่งข้อความเรียบร้อย! (Sent as ${profile.displayName})`);
        liff.closeWindow();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการส่ง: ' + err.message + '\n\nกรุณาตรวจสอบ JSON ว่าถูกต้องหรือไม่');
      }
    });

    shareBtn.addEventListener('click', async () => {
      try {
        const messages = createMessages();
        // เลือกเพื่อนส่ง
        if (liff.isApiAvailable('shareTargetPicker')) {
          const res = await liff.shareTargetPicker(messages);
          if (res) liff.closeWindow();
        } else {
          alert('Device not supported for Share Target Picker');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการแชร์: ' + err.message + '\n\nกรุณาตรวจสอบ JSON ว่าถูกต้องหรือไม่');
      }
    });

  } catch (err) {
    console.error(err);
    loadingUI.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

main();
