#!/usr/bin/env python3
"""Extract ONLY the reviewer-approved 5S shadow-board photos from source PDF page 14.
Never substitute other photographs. Fail closed if two side-by-side source images cannot be located.
"""
import io, pathlib, urllib.request
import fitz

URL="https://www.sibmbengaluru.edu.in/wp-content/uploads/2023/08/4_Kaizen.pdf"
req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0 (compatible; HD20EvidenceExtractor/1.0)"})
with urllib.request.urlopen(req,timeout=45) as response: source=response.read()
if not source.startswith(b"%PDF"): raise SystemExit("NOT_PDF: publisher did not return original paper")
doc=fitz.open(stream=source,filetype="pdf")
page=doc[13]  # 14th PDF page, publication's printed page 57
pics=[]
for entry in page.get_images(full=True):
    for rect in page.get_image_rects(entry[0]):
        if rect.width>50 and rect.height>40 and rect.y0>page.rect.height*0.35:
            pics.append(rect)
pics.sort(key=lambda r:r.x0)
print("IMAGE_RECTS",[(round(p.x0),round(p.y0),round(p.width),round(p.height)) for p in pics])
if len(pics)!=2 or not pics[0].x1<=pics[1].x0:
    raise SystemExit("AMBIGUOUS_IMAGES: unable to isolate exact side-by-side photos, manual approval required")
out=pathlib.Path("assets/adv-guide");out.mkdir(parents=True,exist_ok=True)
for name,rect in zip(("before","after"),pics):
    pix=page.get_pixmap(matrix=fitz.Matrix(3,3),clip=rect,alpha=False)
    target=out/f"expert-5s-{name}.png"
    pix.save(str(target))
    print("CREATED",target,pix.width,pix.height)
