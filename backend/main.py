import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session, relationship
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

# ==================== Database ====================
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "micglier.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== Models ====================

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    image = Column(String(500), default="")
    display_order = Column(Integer, default=0)
    visible = Column(Boolean, default=True)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    sale_price = Column(Float, nullable=True)
    material = Column(String(100), default="")
    image = Column(String(500), default="")
    image2 = Column(String(500), default="")
    image3 = Column(String(500), default="")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")
    featured = Column(Boolean, default=False)
    bestseller = Column(Boolean, default=False)
    new_arrival = Column(Boolean, default=False)
    visible = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Banner(Base):
    __tablename__ = "banners"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), default="")
    subtitle = Column(Text, default="")
    image = Column(String(500), default="")
    button_text = Column(String(100), default="")
    button_link = Column(String(500), default="")
    position = Column(String(50), default="hero")
    visible = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class Promotion(Base):
    __tablename__ = "promotions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(200), nullable=False)
    discount_percent = Column(Integer, default=0)
    badge_visible = Column(Boolean, default=True)
    topbar_text = Column(String(300), default="")
    topbar_visible = Column(Boolean, default=True)


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    icon = Column(String(50), default="")
    visible = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    visible = Column(Boolean, default=True)


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, default="")


class GalleryImage(Base):
    __tablename__ = "gallery_images"
    id = Column(Integer, primary_key=True, index=True)
    image = Column(String(500), nullable=False)
    alt = Column(String(200), default="")
    display_order = Column(Integer, default=0)
    visible = Column(Boolean, default=True)


# ==================== Auth ====================

SECRET_KEY = os.environ.get("JWT_SECRET", "micglier-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido o expirado")


# ==================== App ====================

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MicGlier Admin API")

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ADMIN_DIR = os.path.join(os.path.dirname(__file__), "admin")


@app.get("/admin", response_class=HTMLResponse)
@app.get("/admin/{path:path}", response_class=HTMLResponse)
def serve_admin(path: str = ""):
    return FileResponse(os.path.join(ADMIN_DIR, "index.html"))


# ==================== Seed ====================

def seed_defaults():
    db = next(get_db())
    try:
        if db.query(Admin).count() == 0:
            db.add(Admin(username="admin", hashed_password=hash_password("MicGlier2026!")))
            db.commit()

        default_settings = {
            "site_name": "MicGlier Jewelry",
            "slogan": "BRIGHT \u2022 GLAM \u2022 LUXURY",
            "phone": "+34 600 000 000",
            "email": "info@micglierjewelry.com",
            "address": "Passeig de Gr\u00e0cia, 08007 Barcelona",
            "hours": "Lun - S\u00e1b: 10:00 - 20:00",
            "whatsapp": "34600000000",
            "instagram": "", "facebook": "",
            "hero_title": "Joyer\u00eda Exclusiva\\nen Barcelona",
            "hero_subtitle": "Llama o chatea con un joyero personal para una experiencia \u00fanica de lujo.",
            "hero_image": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800",
            "about_text": "Con m\u00e1s de 15 a\u00f1os de experiencia en el mundo de la joyer\u00eda de lujo, MicGlier Jewelry es sin\u00f3nimo de excelencia artesanal en Barcelona.",
            "about_image": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600",
        }
        for key, value in default_settings.items():
            if not db.query(SiteSettings).filter(SiteSettings.key == key).first():
                db.add(SiteSettings(key=key, value=value))
        db.commit()

        if db.query(Promotion).count() == 0:
            db.add(Promotion(text="OBT\u00c9N 10% OFF", discount_percent=10, badge_visible=True,
                             topbar_text="Llama o escr\u00edbenos para atenci\u00f3n VIP personalizada", topbar_visible=True))
            db.commit()

        if db.query(Category).count() == 0:
            for i, (name, slug) in enumerate([("Anillos", "anillos"), ("Collares", "collares"),
                                               ("Cadenas de Oro", "cadenas-de-oro"), ("Pulseras", "pulseras"), ("Pendientes", "pendientes")]):
                db.add(Category(name=name, slug=slug, display_order=i))
            db.commit()

        if db.query(Service).count() == 0:
            for i, (t, d, ic) in enumerate([
                ("Venta de Joyas", "Colecciones exclusivas de anillos, collares, pulseras y pendientes en oro, plata y platino.", "gem"),
                ("Mantenimiento", "Limpieza profesional, pulido, reparaci\u00f3n de cierres y restauraci\u00f3n completa de joyas.", "tools"),
                ("Dise\u00f1o Personalizado", "Crea la joya de tus sue\u00f1os con nuestros maestros artesanos. Modelado 3D y fabricaci\u00f3n artesanal.", "pencil"),
            ]):
                db.add(Service(title=t, description=d, icon=ic, display_order=i))
            db.commit()

        if db.query(Product).count() == 0:
            cat_map = {c.slug: c.id for c in db.query(Category).all()}
            sample = [
                ("Anillo Solitario Diamante", 2600, "Oro 14K", "anillos", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", True, True),
                ("Collar Cuban Link Oro", 4800, "Oro 18K", "collares", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", False, True),
                ("Pendientes Diamantes Portugueses", 1350, "Oro 14K", "pendientes", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", False, True),
                ("Pulsera Tennis Diamantes", 3150, "Plata .925", "pulseras", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400", False, True),
                ("Anillo Eternity Diamantes", 7400, "Oro 18K", "anillos", "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400", True, True),
                ("Reloj Oro Rosa Diamantes", 11850, "Oro Rosa", "pulseras", "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400", True, False),
                ("Anillo Compromiso Halo", 9600, "Platino", "anillos", "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=400", True, False),
                ("Anillo Cuban Link Diamantes", 3150, "Oro 14K", "anillos", "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=400", False, False),
                ("Cadena Cuban Link S\u00f3lida", 4500, "Oro 14K", "cadenas-de-oro", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", False, True),
                ("Collar Tennis Diamantes", 12800, "Oro 18K", "collares", "https://images.unsplash.com/photo-1515562141589-67f0d89c43e6?w=400", True, False),
                ("Cadena Rope Oro S\u00f3lido", 3350, "Oro 14K", "cadenas-de-oro", "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400", False, False),
                ("Cadena Franco Plata Diamantes", 2200, "Plata .925", "cadenas-de-oro", "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400", False, False),
                ("Anillo Diamantes Bespoke", 8500, "Oro 18K", "anillos", "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400", True, False),
                ("Collar Barcelona Eterna", 12500, "Oro 18K", "collares", "https://images.unsplash.com/photo-1515562141589-67f0d89c43e6?w=400", False, False),
                ("Anillo Compromiso Platino", 15200, "Platino", "anillos", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", True, False),
                ("Pulsera Oro Rosa Artesanal", 6800, "Oro Rosa", "pulseras", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400", False, False),
            ]
            for i, (name, price, mat, cat_slug, img, feat, best) in enumerate(sample):
                db.add(Product(name=name, price=price, material=mat, category_id=cat_map.get(cat_slug),
                               image=img, featured=feat, bestseller=best, visible=True, display_order=i))
            db.commit()

        if db.query(Testimonial).count() == 0:
            for name, text, rating in [
                ("Mar\u00eda Garc\u00eda", "Incre\u00edble experiencia. El anillo de compromiso qued\u00f3 perfecto.", 5),
                ("Carlos Rodr\u00edguez", "El servicio de mantenimiento es excepcional. Mis joyas lucen como nuevas.", 5),
                ("Ana Mart\u00ednez", "El dise\u00f1o personalizado super\u00f3 mis expectativas. Verdaderos artesanos.", 5),
            ]:
                db.add(Testimonial(name=name, text=text, rating=rating))
            db.commit()

        if db.query(GalleryImage).count() == 0:
            for i, url in enumerate([
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400",
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
                "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
            ]):
                db.add(GalleryImage(image=url, display_order=i))
            db.commit()
    finally:
        db.close()


seed_defaults()


# ==================== Schemas ====================

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CategorySchema(BaseModel):
    id: Optional[int] = None
    name: str
    slug: str
    image: str = ""
    display_order: int = 0
    visible: bool = True

class ProductSchema(BaseModel):
    id: Optional[int] = None
    name: str
    description: str = ""
    price: float
    sale_price: Optional[float] = None
    material: str = ""
    image: str = ""
    image2: str = ""
    image3: str = ""
    category_id: Optional[int] = None
    featured: bool = False
    bestseller: bool = False
    new_arrival: bool = False
    visible: bool = True
    display_order: int = 0

class BannerSchema(BaseModel):
    id: Optional[int] = None
    title: str = ""
    subtitle: str = ""
    image: str = ""
    button_text: str = ""
    button_link: str = ""
    position: str = "hero"
    visible: bool = True
    display_order: int = 0

class PromotionSchema(BaseModel):
    id: Optional[int] = None
    text: str
    discount_percent: int = 0
    badge_visible: bool = True
    topbar_text: str = ""
    topbar_visible: bool = True

class ServiceSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str = ""
    icon: str = ""
    visible: bool = True
    display_order: int = 0

class TestimonialSchema(BaseModel):
    id: Optional[int] = None
    name: str
    text: str
    rating: int = 5
    visible: bool = True

class GalleryImageSchema(BaseModel):
    id: Optional[int] = None
    image: str
    alt: str = ""
    display_order: int = 0
    visible: bool = True

class SettingSchema(BaseModel):
    key: str
    value: str


# ==================== Auth Endpoints ====================

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == req.username).first()
    if not admin or not verify_password(req.password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    return TokenResponse(access_token=create_access_token({"sub": admin.username}))


@app.post("/api/auth/change-password")
def change_password(old_password: str = Form(...), new_password: str = Form(...),
                    admin_user: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == admin_user).first()
    if not admin or not verify_password(old_password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Contrasena actual incorrecta")
    admin.hashed_password = hash_password(new_password)
    db.commit()
    return {"ok": True}


# ==================== Upload ====================

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), _admin: str = Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"):
        raise HTTPException(status_code=400, detail="Formato no permitido")
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/uploads/{filename}"}


# ==================== CRUD Helpers ====================

def crud_list(model, db, order_col=None, filters=None):
    q = db.query(model)
    if filters:
        for f in filters:
            q = q.filter(f)
    if order_col:
        q = q.order_by(order_col)
    return q.all()


def crud_create(model, schema, db):
    obj = model(**schema.model_dump(exclude={"id"}))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def crud_update(model, obj_id, schema, db):
    obj = db.query(model).get(obj_id)
    if not obj:
        raise HTTPException(status_code=404)
    for k, v in schema.model_dump(exclude={"id"}).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def crud_delete(model, obj_id, db):
    obj = db.query(model).get(obj_id)
    if not obj:
        raise HTTPException(status_code=404)
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ==================== Categories ====================

@app.get("/api/categories", response_model=List[CategorySchema])
def list_categories(db: Session = Depends(get_db)):
    return crud_list(Category, db, Category.display_order)

@app.post("/api/categories", response_model=CategorySchema)
def create_category(data: CategorySchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(Category, data, db)

@app.put("/api/categories/{cid}", response_model=CategorySchema)
def update_category(cid: int, data: CategorySchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Category, cid, data, db)

@app.delete("/api/categories/{cid}")
def delete_category(cid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(Category, cid, db)


# ==================== Products ====================

@app.get("/api/products", response_model=List[ProductSchema])
def list_products(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    filters = [Product.category_id == category_id] if category_id else None
    return crud_list(Product, db, Product.display_order, filters)

@app.get("/api/products/{pid}", response_model=ProductSchema)
def get_product(pid: int, db: Session = Depends(get_db)):
    p = db.query(Product).get(pid)
    if not p: raise HTTPException(status_code=404)
    return p

@app.post("/api/products", response_model=ProductSchema)
def create_product(data: ProductSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(Product, data, db)

@app.put("/api/products/{pid}", response_model=ProductSchema)
def update_product(pid: int, data: ProductSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Product, pid, data, db)

@app.delete("/api/products/{pid}")
def delete_product(pid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(Product, pid, db)


# ==================== Banners ====================

@app.get("/api/banners", response_model=List[BannerSchema])
def list_banners(db: Session = Depends(get_db)):
    return crud_list(Banner, db, Banner.display_order)

@app.post("/api/banners", response_model=BannerSchema)
def create_banner(data: BannerSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(Banner, data, db)

@app.put("/api/banners/{bid}", response_model=BannerSchema)
def update_banner(bid: int, data: BannerSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Banner, bid, data, db)

@app.delete("/api/banners/{bid}")
def delete_banner(bid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(Banner, bid, db)


# ==================== Promotions ====================

@app.get("/api/promotions", response_model=List[PromotionSchema])
def list_promotions(db: Session = Depends(get_db)):
    return db.query(Promotion).all()

@app.put("/api/promotions/{pid}", response_model=PromotionSchema)
def update_promotion(pid: int, data: PromotionSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Promotion, pid, data, db)


# ==================== Services ====================

@app.get("/api/services", response_model=List[ServiceSchema])
def list_services(db: Session = Depends(get_db)):
    return crud_list(Service, db, Service.display_order)

@app.post("/api/services", response_model=ServiceSchema)
def create_service(data: ServiceSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(Service, data, db)

@app.put("/api/services/{sid}", response_model=ServiceSchema)
def update_service(sid: int, data: ServiceSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Service, sid, data, db)

@app.delete("/api/services/{sid}")
def delete_service(sid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(Service, sid, db)


# ==================== Testimonials ====================

@app.get("/api/testimonials", response_model=List[TestimonialSchema])
def list_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).all()

@app.post("/api/testimonials", response_model=TestimonialSchema)
def create_testimonial(data: TestimonialSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(Testimonial, data, db)

@app.put("/api/testimonials/{tid}", response_model=TestimonialSchema)
def update_testimonial(tid: int, data: TestimonialSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(Testimonial, tid, data, db)

@app.delete("/api/testimonials/{tid}")
def delete_testimonial(tid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(Testimonial, tid, db)


# ==================== Gallery ====================

@app.get("/api/gallery", response_model=List[GalleryImageSchema])
def list_gallery(db: Session = Depends(get_db)):
    return crud_list(GalleryImage, db, GalleryImage.display_order)

@app.post("/api/gallery", response_model=GalleryImageSchema)
def create_gallery_image(data: GalleryImageSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_create(GalleryImage, data, db)

@app.put("/api/gallery/{gid}", response_model=GalleryImageSchema)
def update_gallery_image(gid: int, data: GalleryImageSchema, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_update(GalleryImage, gid, data, db)

@app.delete("/api/gallery/{gid}")
def delete_gallery_image(gid: int, db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    return crud_delete(GalleryImage, gid, db)


# ==================== Settings ====================

@app.get("/api/settings")
def list_settings(db: Session = Depends(get_db)):
    return {s.key: s.value for s in db.query(SiteSettings).all()}

@app.put("/api/settings")
def update_settings(data: List[SettingSchema], db: Session = Depends(get_db), _a: str = Depends(get_current_admin)):
    for item in data:
        setting = db.query(SiteSettings).filter(SiteSettings.key == item.key).first()
        if setting:
            setting.value = item.value
        else:
            db.add(SiteSettings(key=item.key, value=item.value))
    db.commit()
    return {"ok": True}


# ==================== Public API ====================

@app.get("/api/public/site")
def public_site_data(db: Session = Depends(get_db)):
    settings = {s.key: s.value for s in db.query(SiteSettings).all()}
    categories = db.query(Category).filter(Category.visible == True).order_by(Category.display_order).all()
    products = db.query(Product).filter(Product.visible == True).order_by(Product.display_order).all()
    services = db.query(Service).filter(Service.visible == True).order_by(Service.display_order).all()
    testimonials = db.query(Testimonial).filter(Testimonial.visible == True).all()
    gallery = db.query(GalleryImage).filter(GalleryImage.visible == True).order_by(GalleryImage.display_order).all()
    promotions = db.query(Promotion).all()
    banners = db.query(Banner).filter(Banner.visible == True).order_by(Banner.display_order).all()

    return {
        "settings": settings,
        "categories": [CategorySchema.model_validate(c, from_attributes=True).model_dump() for c in categories],
        "products": [ProductSchema.model_validate(p, from_attributes=True).model_dump() for p in products],
        "services": [ServiceSchema.model_validate(s, from_attributes=True).model_dump() for s in services],
        "testimonials": [TestimonialSchema.model_validate(t, from_attributes=True).model_dump() for t in testimonials],
        "gallery": [GalleryImageSchema.model_validate(g, from_attributes=True).model_dump() for g in gallery],
        "promotions": [PromotionSchema.model_validate(p, from_attributes=True).model_dump() for p in promotions],
        "banners": [BannerSchema.model_validate(b, from_attributes=True).model_dump() for b in banners],
    }
