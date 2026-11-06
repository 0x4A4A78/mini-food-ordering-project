from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

ROOT = Path(__file__).parent
OUT = ROOT / 'food-ordering-presentation.pptx'
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
GREEN = RGBColor(22, 57, 44)
CREAM = RGBColor(248, 247, 239)
ORANGE = RGBColor(180, 87, 42)
GRAY = RGBColor(80, 101, 89)

def box(slide, x, y, w, h, fill, radius=False):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid(); shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    return shape

def txt(slide, text, x, y, w, h, size=22, color=GREEN, bold=False, align=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(.02)
    tf.margin_top = tf.margin_bottom = Inches(.02)
    for i, line in enumerate(text.split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line; p.font.name = 'Leelawadee UI'; p.font.size = Pt(size)
        p.font.bold = bold; p.font.color.rgb = color
        if align: p.alignment = align
    return tb

def slide(kicker, title, number):
    s = prs.slides.add_slide(BLANK)
    box(s, 0, 0, 13.333, 7.5, CREAM)
    box(s, 0, 0, .19, 7.5, GREEN)
    txt(s, kicker.upper(), .7, .42, 11.7, .36, 13, ORANGE, True)
    txt(s, title, .7, .85, 11.8, .9, 32, GREEN, True)
    txt(s, f'{number:02d} / 08', 11.5, 7.04, 1.1, .26, 11, GRAY, False, PP_ALIGN.RIGHT)
    return s

def image(s, path, x, y, w, h):
    from PIL import Image
    p = ROOT / path
    with Image.open(p) as im: iw, ih = im.size
    scale = min(w/iw, h/ih); ww, hh = iw*scale, ih*scale
    s.shapes.add_picture(str(p), Inches(x+(w-ww)/2), Inches(y+(h-hh)/2), Inches(ww), Inches(hh))

s = slide('Mini Project · CI/CD', 'ครัวบ้านเรา', 1)
txt(s, 'ระบบสั่งอาหารบุฟเฟต์จากโต๊ะถึงครัว', .75, 2.0, 10.8, .75, 28)
box(s, .75, 3.1, 11.8, 1.45, GREEN, True)
txt(s, 'ลูกค้าเลือกเมนู  →  ส่งคำสั่งเป็นรอบ  →  ครัวติดตามสถานะ', 1.1, 3.52, 11.0, .65, 23, CREAM, True, PP_ALIGN.CENTER)
txt(s, 'สมาชิกกลุ่ม: เติมชื่อสมาชิก 3–4 คนก่อนนำเสนอ', .75, 6.25, 11.6, .5, 16, GRAY)

s = slide('Problem & solution', 'ทำไมต้องมีระบบนี้', 2)
for y, n, head, body in [
    (2.0,'01','สั่งง่าย','ลูกค้าเลือกอาหารเองจากลิงก์ประจำโต๊ะ'),
    (3.3,'02','แยกโต๊ะชัดเจน','ครัวเห็นเลขโต๊ะและรายการแต่ละรอบ'),
    (4.6,'03','ติดตามงานได้','เปลี่ยนสถานะจากรับออร์เดอร์จนเสิร์ฟ')]:
    box(s,.75,y,11.8,1.07,RGBColor(232,238,226),True)
    txt(s,n,.98,y+.2,.7,.45,22,ORANGE,True)
    txt(s,head,1.8,y+.15,2.9,.5,22,GREEN,True)
    txt(s,body,4.55,y+.18,7.4,.5,19,GREEN)

s = slide('Customer flow', 'ลูกค้าสั่งอาหารอย่างไร', 3)
steps=['เปิดลิงก์ประจำโต๊ะ','เลือกหมวดและเมนู','เพิ่มจำนวนจาน','ส่งคำสั่งเข้าครัว','สั่งเพิ่มเป็นรอบใหม่']
for i, label in enumerate(steps):
    x=.7+i*2.52
    box(s,x,2.2,2.26,2.25,GREEN,True)
    txt(s,f'{i+1:02d}',x+.17,2.48,1.7,.56,28,RGBColor(237,185,117),True)
    txt(s,label,x+.17,3.23,1.9,.85,18,CREAM,True)
txt(s,'ตัวอย่าง: localhost:3001/?table=4',.78,5.47,11.5,.55,20,GRAY)

s = slide('Customer screen', 'หน้าสั่งอาหาร', 4)
image(s,'evidence/food-ordering-deployed.png',.72,1.85,8.6,4.68)
box(s,9.55,2.0,2.95,4.25,GREEN,True)
txt(s,'16 เมนู\n\n6 หมวด\n\nสั่งเพิ่มได้หลายรอบ',9.85,2.4,2.35,3.7,21,CREAM,True)

s = slide('Kitchen screen', 'หน้าครัวและสถานะ', 5)
image(s,'evidence/order-management.png',.72,1.85,8.6,4.68)
box(s,9.55,2.0,2.95,4.25,GREEN,True)
txt(s,'ส่งเข้าครัวแล้ว\n↓\nกำลังเตรียม\n↓\nเสิร์ฟแล้ว',9.85,2.35,2.4,3.5,19,CREAM,True)

s = slide('Architecture', 'ส่วนประกอบของระบบ', 6)
for i,(head,body) in enumerate([('Browser','ลูกค้าและครัว'),('Node.js API','รับและจัดการคำสั่ง'),('JSON data','เก็บข้อมูลตัวอย่าง')]):
    x=.78+i*4.14
    box(s,x,2.15,3.75,2.35,GREEN,True)
    txt(s,head,x+.24,2.58,3.26,.62,25,CREAM,True)
    txt(s,body,x+.24,3.43,3.22,.6,17,CREAM)
txt(s,'GitHub เก็บและรวมโค้ด  •  Jenkins ทำ Build, Test, Deploy',.8,5.45,11.7,.6,21,GRAY)

s = slide('CI/CD', 'GitHub → Jenkins → Deploy', 7)
image(s,'evidence/jenkins-stage-view.png',.72,1.85,8.6,4.55)
box(s,9.55,2.0,2.95,4.2,GREEN,True)
txt(s,'Checkout\n↓\nBuild\n↓\nTest: ผ่าน 4 กรณี\n↓\nDeploy',9.84,2.3,2.45,3.75,18,CREAM,True)

s = slide('Results & next steps', 'ผลลัพธ์และสิ่งที่ต่อยอดได้', 8)
txt(s,'ระบบรันได้จริงที่ localhost:3001',.8,1.97,11.6,.66,25,GREEN,True)
txt(s,'Jenkins Build / Test / Deploy สำเร็จ · ชุดทดสอบผ่าน 4 กรณี',.8,2.85,11.7,.7,21,GREEN)
box(s,.78,4.15,11.75,1.48,RGBColor(232,238,226),True)
txt(s,'ต่อยอด: QR Code จริง · ฐานข้อมูล · ระบบเข้าสู่ระบบ · การชำระเงิน',1.1,4.53,11.15,.7,20,GREEN,True)
txt(s,'GitHub: github.com/0x4A4A78/mini-food-ordering-project',.8,6.23,11.6,.55,17,GRAY)

prs.save(OUT)
print(OUT)
