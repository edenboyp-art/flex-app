// ใส่ LIFF ID ของคุณที่นี่
const LIFF_ID = '2009073203-kPdSUtmr'; // เช่น '1234567890-abcdefgh'

let liffInitialized = false;

// เริ่มต้น LIFF เมื่อโหลดหน้าเว็บ
window.addEventListener('load', async () => {
    try {
        await liff.init({ liffId: LIFF_ID });
        liffInitialized = true;
        
        if (!liff.isLoggedIn()) {
            // ถ้ายังไม่ login ให้ redirect ไป login
            liff.login();
            return;
        }
        
        // ดึงข้อมูลโปรไฟล์ผู้ใช้
        await loadUserProfile();
        
        // เพิ่ม event listener ให้ปุ่มส่ง
        document.getElementById('sendBtn').addEventListener('click', sendFlexMessage);
        
        // Update preview เมื่อมีการเปลี่ยนแปลง
        document.getElementById('title').addEventListener('input', updatePreview);
        document.getElementById('content').addEventListener('input', updatePreview);
        document.getElementById('color').addEventListener('input', updatePreview);
        
        updatePreview();
        
    } catch (error) {
        console.error('LIFF initialization failed', error);
        showStatus('error', 'เกิดข้อผิดพลาดในการเริ่มต้นแอป: ' + error.message);
    }
});

// โหลดข้อมูลผู้ใช้
async function loadUserProfile() {
    try {
        const profile = await liff.getProfile();
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('userName').textContent = profile.displayName;
        document.getElementById('userPic').src = profile.pictureUrl;
        document.getElementById('userStatus').textContent = profile.statusMessage || 'ไม่มีสถานะ';
    } catch (error) {
        console.error('Failed to get profile', error);
    }
}

// สร้าง Flex Message
function createFlexMessage(title, content, color) {
    return {
        type: 'bubble',
        size: 'giga',
        header: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: title,
                    color: '#ffffff',
                    size: 'xl',
                    weight: 'bold'
                }
            ],
            backgroundColor: color,
            paddingAll: '20px'
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: content,
                    wrap: true,
                    size: 'md',
                    color: '#666666'
                }
            ],
            paddingAll: '20px'
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'uri',
                        label: '🔄 แชร์ข้อความนี้',
                        uri: `https://liff.line.me/${LIFF_ID}`
                    },
                    style: 'primary',
                    color: color,
                    height: 'sm'
                },
                {
                    type: 'button',
                    action: {
                        type: 'uri',
                        label: 'ดูข้อมูลเพิ่มเติม',
                        uri: 'https://line.me'
                    },
                    style: 'link',
                    height: 'sm'
                }
            ],
            spacing: 'sm',
            paddingAll: '20px'
        }
    };
}

// ส่ง Flex Message ด้วย Share Target Picker
async function sendFlexMessage() {
    if (!liffInitialized) {
        showStatus('error', 'กรุณารอสักครู่...');
        return;
    }

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const color = document.getElementById('color').value;

    if (!title || !content) {
        showStatus('error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    try {
        const flexMessage = createFlexMessage(title, content, color);
        
        // เช็คว่ารองรับ Share Target Picker หรือไม่
        if (!liff.isApiAvailable('shareTargetPicker')) {
            showStatus('error', 'อุปกรณ์นี้ไม่รองรับการแชร์');
            return;
        }

        // เปิด Share Target Picker
        const result = await liff.shareTargetPicker([
            {
                type: 'flex',
                altText: title,
                contents: flexMessage
            }
        ]);

        if (result) {
            showStatus('success', '✅ ส่งข้อความสำเร็จ!');
        } else {
            showStatus('error', 'ยกเลิกการส่ง');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showStatus('error', 'เกิดข้อผิดพลาด: ' + error.message);
    }
}

// แสดงสถานะ
function showStatus(type, message) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Update preview
function updatePreview() {
    const title = document.getElementById('title').value || 'หัวข้อ';
    const content = document.getElementById('content').value || 'เนื้อหา';
    const color = document.getElementById('color').value;
    
    const preview = document.getElementById('flexPreview');
    preview.innerHTML = `
        <div style="border: 2px solid #ddd; border-radius: 12px; overflow: hidden; max-width: 300px;">
            <div style="background: ${color}; color: white; padding: 15px; font-weight: bold;">
                ${title}
            </div>
            <div style="padding: 15px; background: white;">
                ${content}
            </div>
            <div style="padding: 10px; background: #f5f5f5;">
                <button style="width: 100%; padding: 10px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 แชร์ข้อความนี้
                </button>
            </div>
        </div>
    `;
}