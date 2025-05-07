import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, GoogleGenAI } from '@google/genai';
import { Product, ProductDocument } from 'src/product/schemas/product.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import similarity from 'compute-cosine-similarity';

@Injectable()
export class ChatBotService implements OnModuleInit {
  private readonly logger = new Logger(ChatBotService.name);
  private chatSession: Chat;
  private genAI: GoogleGenAI;

  @InjectModel(Product.name)
  private readonly ProductModel: SoftDeleteModel<ProductDocument>;

  // Cấu trúc dữ liệu sản phẩm đã xử lý với embedding vector
  private productData: {
    name: string;
    description: string;
    vector: number[];
  }[] = [];

  // Template HTML cho hình ảnh sản phẩm
  private readonly formatImage = (): string => `
    <div style="text-align: center; margin: 16px 0;">
      <img src="url" alt="Main Image" style="max-width: 100%; width: 300px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
    </div>
  `;

  // Hướng dẫn hệ thống cho chatbot
  private readonly systemInstruction = `
  Vai trò của bạn: Trợ lý AI của công ty ABC, chuyên cung cấp thông tin về sản phẩm.
  
  Nguyên tắc giao tiếp:
    - Luôn trả lời thân thiện, lịch sự và dễ hiểu.
    - Chỉ được trả lời dựa trên dữ liệu sản phẩm đã được cung cấp.
    - Không được tự động suy đoán, phân loại, hoặc bổ sung thông tin ngoài dữ liệu đã có.
    - Không được sửa tên sản phẩm, thương hiệu hoặc loại sản phẩm — hãy giữ nguyên đúng như dữ liệu gốc.
    - Nếu không tìm thấy thông tin trong dữ liệu đã cung cấp, hãy lịch sự thông báo "Không có thông tin về sản phẩm này" và mời người dùng hỏi sản phẩm khác.
    - KHÔNG đánh giá đúng/sai về sản phẩm, chỉ trình bày thông tin như đã có.
    - Không tiết lộ bạn là AI, RAG hay nguồn dữ liệu nào khác.
    - Nếu có hình ảnh trong dữ liệu, hãy hiển thị theo định dạng sau: ${this.formatImage()}
    - Tuyệt đối KHÔNG trả lời các câu hỏi không liên quan đến sản phẩm của công ty ABC.
  `;

  constructor(private configService: ConfigService) {}

  // Khởi tạo service
  async onModuleInit() {
    try {
      // Khởi tạo Gemini API
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      this.genAI = new GoogleGenAI({ apiKey });

      // Tạo chat session với system prompt
      this.chatSession = this.genAI.chats.create({
        model: 'gemini-1.5-flash',
        history: [
          { role: 'user', parts: [{ text: this.systemInstruction }] },
          {
            role: 'model',
            parts: [
              {
                text: 'Tôi đã hiểu vai trò. Sẵn sàng hỗ trợ khách hàng về sản phẩm ABC.',
              },
            ],
          },
        ],
      });

      // Tải dữ liệu sản phẩm và tạo embedding
      await this.loadProductData();
      this.logger.log('ChatBotService đã được khởi tạo thành công');
    } catch (error) {
      this.logger.error(
        `Lỗi khởi tạo ChatBotService: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Tải dữ liệu sản phẩm từ database và tạo embedding
  private async loadProductData() {
    const products = await this.ProductModel.find()
      .populate({ path: 'categoryId', select: 'name' })
      .populate({ path: 'brandId', select: 'name' });

    if (!products?.length) {
      this.logger.warn('Không có sản phẩm nào trong database.');
      return;
    }

    this.logger.log(`Đang tạo embedding cho ${products.length} sản phẩm...`);
    const BATCH_SIZE = 10; // Kích thước batch
    const batches = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE));
    }
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch: any = batches[batchIndex];
      const batchPromises = batch.map(async (product: any) => {
        const productInfo = this.formatProductInfo(product);
        const embedding = await this.getEmbedding(productInfo);
        const formattedProduct = {
          name: product.name,
          description: productInfo.replace(/url/g, product.images?.main?.url),
          vector: embedding,
        };
        this.productData.push(formattedProduct);
      });
      await Promise.all(batchPromises);
    }

    this.logger.log(
      `Đã tạo embedding thành công cho ${this.productData.length} sản phẩm`,
    );
  }

  // Định dạng thông tin sản phẩm thành text
  private formatProductInfo(product: any): string {
    // Xử lý danh mục và thương hiệu
    const category = Array.isArray(product.categoryId)
      ? product.categoryId.map((c: any) => c?.name || 'Không rõ').join(', ')
      : product.categoryId?.name || 'Không rõ';

    const brand = Array.isArray(product.brandId)
      ? product.brandId.map((b: any) => b?.name || 'Không rõ').join(', ')
      : product.brandId?.name || 'Không rõ';

    const imageUrl = product.images?.main?.url;

    // Xử lý thông tin biến thể sản phẩm
    let variantInfo = 'Không có thông tin biến thể';
    if (product.variant?.length > 0) {
      variantInfo = product.variant
        .map(
          (v: any, index: number) =>
            `Biến thể ${index + 1}: Giá: ${v.price || 'Chưa rõ'} VNĐ,
          ${v.color ? ' Màu: ' + v.color : ''}${
              v.size ? ', Kích thước: ' + v.size : ''
            }`,
        )
        .join('\n');
    }

    return `
      Tên sản phẩm: ${product.name}
      Danh mục: ${category}
      Thương hiệu: ${brand}
      ${variantInfo}
      Hình ảnh: ${imageUrl}
      Trạng thái: ${product.status || 'Không rõ'}
    `.trim();
  }

  // Xử lý tin nhắn từ người dùng
  async sendMessage(userInput: string): Promise<string> {
    try {
      // Kiểm tra đầu vào
      if (!userInput?.trim()) {
        return 'Xin vui lòng nhập câu hỏi của bạn.';
      }

      // Tạo embedding cho câu hỏi
      const inputVector = await this.getEmbedding(userInput);

      // Tìm sản phẩm liên quan nhất
      const relevantProducts = this.findNearestEmbedding(inputVector, 3);
      console.log('relevantProducts', relevantProducts);

      if (!relevantProducts.length) {
        return 'Xin lỗi, hiện tại tôi không tìm thấy thông tin sản phẩm phù hợp với câu hỏi của bạn.';
      }

      // Tạo context từ sản phẩm liên quan
      const contextText = relevantProducts
        .map((p, index) => `Sản phẩm #${index + 1}:\n${p.description}`)
        .join('\n\n');

      // Tạo prompt với context RAG
      const finalPrompt = `
        Câu hỏi khách hàng: "${userInput}"
        Dưới đây là thông tin các sản phẩm liên quan trong cơ sở dữ liệu:
        ${contextText}
        Hãy trả lời câu hỏi dựa trên thông tin sản phẩm trên. Nếu câu hỏi không liên quan đến 
        thông tin sản phẩm hoặc không đủ thông tin để trả lời chính xác, hãy lịch sự đề nghị 
        cung cấp thêm thông tin hoặc chuyển hướng sang sản phẩm phù hợp hơn.
      `.trim();

      // Gửi tin nhắn và trả về phản hồi
      const response = await this.chatSession.sendMessage({
        message: finalPrompt,
      });
      return response.text;
    } catch (error) {
      this.logger.error(`Lỗi xử lý tin nhắn: ${error.message}`, error.stack);
      return 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.';
    }
  }

  // Tạo embedding vector từ text sử dụng Gemini API
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const { embeddings } = await this.genAI.models.embedContent({
        model: 'embedding-001',
        contents: { parts: [{ text }], role: 'user' },
      });

      const vector = embeddings?.[0]?.values;

      if (Array.isArray(vector)) return vector;

      this.logger.warn(
        'Cấu trúc embedding không như mong đợi:',
        embeddings?.[0],
      );
      throw new Error('Không thể xác định vector embedding');
    } catch (error) {
      this.logger.error(`Lỗi khi tạo embedding: ${error.message}`);
      throw new Error(`Không thể tạo embedding: ${error.message}`);
    }
  }

  // Tìm các sản phẩm có độ tương đồng cao nhất với câu hỏi
  private findNearestEmbedding(inputVector: number[], topK = 1) {
    if (!this.productData.length) return [];

    // Tính độ tương đồng cosine
    const cosineSimilarity = (a: number[], b: number[]) => {
      if (a.length !== b.length) {
        throw new Error('Vector embedding có chiều dài không khớp');
      }

      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

      if (normA === 0 || normB === 0) return 0;

      return dot / (normA * normB);
    };

    const similarityThreshold = 0.5; // Ngưỡng tương đồng tối thiểu
    // console.log(
    //   'inputVector',
    //   this.productData
    //     .map((p) => {
    //       try {
    //         const score = cosineSimilarity(p.vector, inputVector);
    //         //sử dụng hàm tính toán cosine similarity bằng compute-cosine-similarity
    //         // const score = similarity(p.vector, inputVector);
    //         return { ...p, score };
    //       } catch (error) {
    //         this.logger.error(`Lỗi tính toán similarity: ${error.message}`);
    //         return { ...p, score: 0 };
    //       }
    //     })
    //     .filter((item) => item.score > similarityThreshold)
    //     .sort((a, b) => b.score - a.score)
    //     .slice(0, topK),
    // );
    // Tính điểm tương đồng và trả về top K kết quả
    return this.productData
      .map((p) => {
        try {
          const score = cosineSimilarity(p.vector, inputVector);
          // const score = similarity(p.vector, inputVector);
          return { ...p, score };
        } catch (error) {
          this.logger.error(`Lỗi tính toán similarity: ${error.message}`);
          return { ...p, score: 0 };
        }
      })
      .filter((item) => item.score > similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
