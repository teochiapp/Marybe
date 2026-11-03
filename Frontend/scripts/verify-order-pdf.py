"""Inspect and render PDFs produced by qa-order-pdf.cjs (requires pymupdf)."""
import json
import re
from pathlib import Path

import pymupdf

folder = Path(__file__).resolve().parents[1] / "tmp" / "pdfs"
expected = json.loads((folder / "expected.json").read_text(encoding="utf-8"))


def compact(text):
    return re.sub(r"\s+", "", str(text))


def money(value):
    return f"{value:,.2f}".translate(str.maketrans({",": ".", ".": ","}))


for name, order in expected.items():
    document = pymupdf.open(folder / f"{name}.pdf")
    pages = [page.get_text() for page in document]
    text = compact("\n".join(pages))
    assert len(document) == 1 if name == "comprobante-diseno" else len(document) > 1
    assert all(page.strip() for page in pages), "Hay paginas vacias"
    for field in ["numero_pedido", "documentId", "estado", "metodo_pago", "cliente_email", "codigo_seguimiento"]:
        assert compact(order[field]) in text, f"Falta {field}"
    assert "Invitado" in text
    for value in order["direccion_envio"].values():
        assert compact(value) in text, f"Falta contacto/entrega: {value}"
    for code in order["gift_cards_generadas"]:
        assert code in text, "Falta gift card"
    assert compact(money(order["total"])) in text, "Falta el total"
    assert "03/11/2610:30hs" in text and "03/11/2611:15hs" in text, "Faltan fechas"
    for item in order["productos"]:
        row_page = next((compact(page) for page in pages if item["sku"] in page), None)
        assert row_page, f"Falta SKU {item['sku']}"
        for value in [item["producto"], item["marca"], item["variante"], item["id_producto"], item["id_variante_original"], item["cantidad"], money(item["precio_unitario"]), money(item["subtotal"])]:
            assert compact(value) in row_page, f"Fila dividida o dato ausente: {value}"
        assert "Descripcion" in row_page or "Descripción" in row_page, "No se repite la cabecera de la tabla"
    assert "comprobanteinterno" in compact(pages[-1]).lower(), "Falta el pie"
    for i, page in enumerate(document):
        assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1, "Formato diferente de A4"
        for block in page.get_text("blocks"):
            assert block[0] >= 0 and block[1] >= 0 and block[2] <= page.rect.width and block[3] <= page.rect.height, "Texto fuera de la pagina"
        page.get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(str(folder / f"{name}-{i + 1}.png"))
    print(f"PASS: {name}: {len(document)} pagina(s), {len(order['productos'])} productos; datos completos, filas integras, A4 y sin paginas vacias.")
