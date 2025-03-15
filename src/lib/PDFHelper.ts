import { PDFDocument, PDFName, PDFString, PDFNumber, PDFPage } from 'pdf-lib';

export class PDFHelper {
	static readonly DEFAULT_WIDTH: number = 500;
	static readonly DEFAULT_HEIGHT: number = 500;

	/**
	 * Creates a JavaScript action dictionary.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param js - The JavaScript code as a string.
	 */
	static createScript(pdfDoc: PDFDocument, js: string) {
		return pdfDoc.context.obj({
			S: PDFName.of('JavaScript'),
			JS: PDFString.of(js)
		});
	}

	/**
	 * Adds a JavaScript action to a given PDF element for the specified event.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param element - The PDF element (page or annotation) to add the action to.
	 * @param event - The event name (e.g., "O" for page open, "K" for key press).
	 * @param jsCode - The JavaScript code to execute.
	 */
	static addJSAction(pdfDoc: PDFDocument, element: any, event: string, jsCode: string) {
		const action = PDFHelper.createScript(pdfDoc, jsCode);
		let aa = element.get(PDFName.of('AA'));
		if (!aa) {
			aa = pdfDoc.context.obj({});
		}
		aa.set(PDFName.of(event), action);
		element.set(PDFName.of('AA'), aa);
	}

	static addGlobalJSAction(pdfDoc: PDFDocument, page: PDFPage, jsCode: string) {
		const jsAction = pdfDoc.context.obj({
			S: PDFName.of('JavaScript'),
			JS: PDFString.of(`try { ${jsCode} } catch (e) { app.alert(e.stack || e); }`)
		});
		page.node.set(PDFName.of('AA'), pdfDoc.context.obj({ O: jsAction }));
	}

	/**
	 * Creates a new page with the default (or provided) dimensions and optional JS actions.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param width - Page width.
	 * @param height - Page height.
	 * @param jsActions - An optional object mapping event names to JavaScript code.
	 */
	static createPage(
		pdfDoc: PDFDocument,
		width: number = PDFHelper.DEFAULT_WIDTH,
		height: number = PDFHelper.DEFAULT_HEIGHT,
		jsActions?: { [event: string]: string }
	) {
		const page = pdfDoc.addPage([width, height]);
		const resources = pdfDoc.context.obj({
			Font: {
				F1: pdfDoc.context.obj({
					Type: PDFName.of('Font'),
					Subtype: PDFName.of('Type1'),
					BaseFont: PDFName.of('Courier')
				})
			}
		});
		page.node.set(PDFName.of('Resources'), resources);

		if (jsActions) {
			for (const event in jsActions) {
				PDFHelper.addJSAction(pdfDoc, page.node, event, jsActions[event]);
			}
		}

		return page;
	}

	/**
	 * Creates a widget annotation field with optional JS actions.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param name - Field name.
	 * @param x - X coordinate.
	 * @param y - Y coordinate.
	 * @param fieldWidth - Field width.
	 * @param fieldHeight - Field height.
	 * @param value - (Optional) Field value.
	 * @param fType - (Optional) Field type (default "Tx" for text).
	 * @param jsActions - (Optional) Object mapping event names to JS code.
	 */
	static createField(
		pdfDoc: PDFDocument,
		name: string,
		x: number,
		y: number,
		fieldWidth: number,
		fieldHeight: number,
		value: string = '',
		fType: string = 'Tx',
		jsActions?: { [event: string]: string },
		color: string = '#e6e6e6'
	) {
		// Convert hex color to RGB components (0-1)
		const r = parseInt(color.slice(1, 3), 16) / 255;
		const g = parseInt(color.slice(3, 5), 16) / 255;
		const b = parseInt(color.slice(5, 7), 16) / 255;

		const rect = pdfDoc.context.obj([x, y, x + fieldWidth, y + fieldHeight]);
		const fieldDict = pdfDoc.context.obj({
			Type: PDFName.of('Annot'),
			Subtype: PDFName.of('Widget'),
			FT: PDFName.of(fType),
			Ff: PDFNumber.of(2),
			Rect: rect,
			T: PDFString.of(name),
			V: PDFString.of(value),
			MK: pdfDoc.context.obj({
				BG: pdfDoc.context.obj([r, g, b])
			}),
			BS: pdfDoc.context.obj({
				W: PDFNumber.of(1),
				S: PDFName.of('S')
			})
		});

		if (jsActions) {
			for (const event in jsActions) {
				PDFHelper.addJSAction(pdfDoc, fieldDict, event, jsActions[event]);
			}
		}
		return fieldDict;
	}

	/**
	 * Creates a field with an appearance stream and optional JS actions.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param name - Field name.
	 * @param x - X coordinate.
	 * @param y - Y coordinate.
	 * @param fieldWidth - Field width.
	 * @param fieldHeight - Field height.
	 * @param r - Red component (0 to 1).
	 * @param g - Green component (0 to 1).
	 * @param b - Blue component (0 to 1).
	 * @param value - (Optional) Field value.
	 * @param jsActions - (Optional) Object mapping event names to JS code.
	 */
	static makeField(
		pdfDoc: PDFDocument,
		name: string,
		x: number,
		y: number,
		fieldWidth: number,
		fieldHeight: number,
		r: number,
		g: number,
		b: number,
		value: string = '',
		jsActions?: { [event: string]: string }
	) {
		const rect = pdfDoc.context.obj([x, y, x + fieldWidth, y + fieldHeight]);
		const fieldDict = pdfDoc.context.obj({
			Type: PDFName.of('Annot'),
			Subtype: PDFName.of('Widget'),
			FT: PDFName.of('Tx'),
			Ff: PDFNumber.of(2),
			Rect: rect,
			MaxLen: PDFNumber.of(160),
			T: PDFString.of(name),
			V: PDFString.of(value),
			MK: pdfDoc.context.obj({
				BG: pdfDoc.context.obj([r, g, b])
			})
		});

		// Create appearance stream content
		const appearanceStreamContent = `
${r} ${g} ${b} rg
0.0 0.0 ${fieldWidth} ${fieldHeight} re f
`;
		const apDict = pdfDoc.context.obj({
			Type: PDFName.of('XObject'),
			Subtype: PDFName.of('Form'),
			FormType: PDFNumber.of(1),
			BBox: pdfDoc.context.obj([0, 0, fieldWidth, fieldHeight]),
			Matrix: pdfDoc.context.obj([1.0, 0.0, 0.0, 1.0, 0.0, 0.0]),
			stream: appearanceStreamContent
		});
		fieldDict.set(PDFName.of('AP'), pdfDoc.context.obj({ N: apDict }));

		if (jsActions) {
			for (const event in jsActions) {
				PDFHelper.addJSAction(pdfDoc, fieldDict, event, jsActions[event]);
			}
		}

		return fieldDict;
	}

	/**
	 * Creates a simple text drawing command stream.
	 * @param x - X coordinate for the text.
	 * @param y - Y coordinate for the text.
	 * @param size - Font size.
	 * @param txt - The text content.
	 */
	static createText(x: number, y: number, size: number, txt: string): string {
		return `
BT
/F1 ${size} Tf
${x} ${y} Td (${txt}) Tj
ET
`;
	}

	/**
	 * Creates a button field with optional JS actions.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param name - Button name.
	 * @param x - X coordinate.
	 * @param y - Y coordinate.
	 * @param fieldWidth - Button width.
	 * @param fieldHeight - Button height.
	 * @param value - Button label.
	 * @param jsActions - (Optional) Object mapping event names to JS code.
	 */
	static createButton(
		pdfDoc: PDFDocument,
		name: string,
		x: number,
		y: number,
		fieldWidth: number,
		fieldHeight: number,
		value: string,
		jsActions?: { [event: string]: string },
		color: string = '#e6e6e6'
	) {
		// Convert hex color to RGB components (0-1)
		const r = parseInt(color.slice(1, 3), 16) / 255;
		const g = parseInt(color.slice(3, 5), 16) / 255;
		const b = parseInt(color.slice(5, 7), 16) / 255;

		// Create a button field by specifying its type as 'Btn'
		const button = PDFHelper.createField(
			pdfDoc,
			name,
			x,
			y,
			fieldWidth,
			fieldHeight,
			'',
			'Btn',
			jsActions,
			color
		);
		button.set(PDFName.of('Ff'), PDFNumber.of(65536));
		button.set(
			PDFName.of('MK'),
			pdfDoc.context.obj({
				BG: pdfDoc.context.obj([r, g, b]),
				CA: PDFString.of(value)
			})
		);
		button.set(
			PDFName.of('BS'),
			pdfDoc.context.obj({
				W: PDFNumber.of(1),
				S: PDFName.of('S')
			})
		);

		return button;
	}

	/**
	 * Creates an image annotation with optional JS actions.
	 * @param pdfDoc - The PDFDocument instance.
	 * @param x - X coordinate.
	 * @param y - Y coordinate.
	 * @param width - Image width.
	 * @param height - Image height.
	 * @param imageBytes - The image data as Uint8Array.
	 * @param jsActions - (Optional) Object mapping event names to JS code.
	 */
	static async createImage(
		pdfDoc: PDFDocument,
		x: number,
		y: number,
		width: number,
		height: number,
		imageBytes: Uint8Array,
		jsActions?: { [event: string]: string }
	) {
		try {
			// Validate JPEG header (SOI marker: FF D8)
			if (imageBytes[0] !== 0xff || imageBytes[1] !== 0xd8) {
				throw new Error('Invalid JPEG format: missing SOI marker');
			}

			// Embed the JPEG image
			const image = await pdfDoc.embedJpg(imageBytes);
			const imageDims = image.scale(1); // Get original dimensions

			// Calculate scaling to fit the desired dimensions while maintaining aspect ratio
			const scaleX = width / imageDims.width;
			const scaleY = height / imageDims.height;
			const scale = Math.min(scaleX, scaleY);

			// Get the first page
			const pages = pdfDoc.getPages();
			const page = pages[0];

			// Draw the image on the page
			page.drawImage(image, {
				x,
				y,
				width: imageDims.width * scale,
				height: imageDims.height * scale
			});

			// Create a transparent annotation for potential JavaScript actions
			if (jsActions) {
				const annotation = pdfDoc.context.obj({
					Type: PDFName.of('Annot'),
					Subtype: PDFName.of('Link'),
					Rect: pdfDoc.context.obj([x, y, x + width, y + height]),
					F: PDFNumber.of(4),
					Border: pdfDoc.context.obj([0, 0, 0])
				});

				for (const event in jsActions) {
					PDFHelper.addJSAction(pdfDoc, annotation, event, jsActions[event]);
				}

				return annotation;
			}

			return null;
		} catch (error) {
			console.error('Error processing image:', error);
			throw new Error(
				`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}
