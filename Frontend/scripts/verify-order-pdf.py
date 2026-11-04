"""Render the browser-generated receipts and verify their printable text."""
from pathlib import Path
import json
import re
import pymupdf as fitz

folder = Path(__file__).resolve().parent.parent / "tmp" / "pdfs"
expected = json.loads((folder / "expected.json").read_text(encoding="utf-8"))


def compact(value):
    return re.sub(r"\s+", "", str(value)).casefold()


def money(value):
    return f"{value:,.2f}".translate(str.maketrans({",": ".", ".": ","}))


for name in ["comprobante-diseno", "comprobante-varias-paginas", "comprobante-referencia"]:
    doc = fitz.open(folder / f"{name}.pdf")
    order = expected[name]
    pages = [page.get_text() for page in doc]
    text = "\n".join(page.get_text() for page in doc)
    normalized = " ".join(text.casefold().split())
    for forbidden in ["id de strapi", "qa-pedido-", "qa-internal-reference-hidden", "qa-hidden-product-id", "todos los datos guardados en strapi"]:
        assert forbidden not in normalized, f"Internal data printed: {forbidden}"
    for required in ["ventas@marybe.com.ar", "+54 385 4211687", "Pellegrini 141, Santiago del Estero", "Método de pago", "Método de envío", "Datos de facturación", "Subtotal", "Nota"]:
        assert required.casefold() in normalized, f"Missing {required} in {name}"
    assert len(doc) == 1 if name != "comprobante-varias-paginas" else len(doc) > 1
    for field in ["numero_pedido", "estado", "cliente_email", "codigo_seguimiento"]:
        if order.get(field):
            assert compact(order[field]) in compact(text), f"Missing {field}"
    payment = "Pago en la entrega" if order["metodo_pago"] == "efectivo" else order["metodo_pago"]
    assert compact(payment) in compact(text), "Missing payment method"
    for key, value in order["direccion_envio"].items():
        if key != "metodo_envio":
            assert compact(value) in compact(text), f"Missing delivery/contact: {value}"
    for value in order.get("direccion_facturacion", {}).values():
        assert compact(value) in compact(text), f"Missing billing data: {value}"
    for code in order["gift_cards_generadas"]:
        assert code in text, "Missing gift card"
    assert compact(money(order["total"])) in compact(text), "Missing order total"
    assert ("29/10/2616:10hs" if name == "comprobante-referencia" else "03/11/2610:30hs") in compact(text), "Missing creation date"
    for item in order["productos"]:
        row_page = next((compact(page) for page in pages if item["sku"] in page), None)
        assert row_page, f"Missing SKU {item['sku']}"
        for value in [item["producto"], item.get("marca", ""), item["variante"], item["cantidad"], money(item["precio_unitario"]), money(item["subtotal"])]:
            assert compact(value) in row_page, f"Split row or missing field: {value}"
        assert "descripción" in row_page or "descripcion" in row_page, "Missing repeated table header"
    assert "comprobantedepedido" in compact(pages[-1]), "Missing footer"
    if name == "comprobante-referencia":
        for required in ["Florencia Cruz Paz", "3815426923", "Avenida Sáenz Peña 221", "San Miguel de Tucumán", "4000", "309976047027", "820 Light", "20.400", "MAIPU 164", "9 a 21", "número de compra y DNI"]:
            assert required.casefold() in normalized, f"Reference field missing: {required}"
        assert len(doc) == 1, "The single-product reference must fit on one A4 page"
    for i, page in enumerate(doc):
        assert len(page.get_text().strip()) > 60, f"Empty or spurious page: {name} {i + 1}"
        assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1, "Not an A4 page"
        for block in page.get_text("blocks"):
            assert block[0] >= 0 and block[1] >= 0 and block[2] <= page.rect.width and block[3] <= page.rect.height, "Text outside page boundaries"
        page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(folder / f"{name}-{i + 1}.png")
    print(f"PASS {name}: {len(doc)} A4 pages, fields verified, internal IDs excluded, PNGs rendered")
