import { ImageData } from "@/types/image-editor";

export interface StoredImage extends ImageData {
  inputImage?: string; // Base64 string for edit operations
  maskImage?: string; // Base64 string for edit operations
  editType?: "generation" | "editing";
  parentImageId?: string;
}

class ImageDatabase {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = "image-editor-db";
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = "images";

  async init() {
    if (this.db) return;

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
          });
          store.createIndex("timestamp", "timestamp");
        }
      };
    });
  }

  async addImage(image: StoredImage): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(image);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.exportToLocalStorage();
        resolve();
      };
    });
  }

  async getAllImages(): Promise<StoredImage[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index("timestamp");
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result.reverse()); // Most recent first
    });
  }

  async getImage(id: string): Promise<StoredImage | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteImage(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exportToLocalStorage(): Promise<void> {
    const images = await this.getAllImages();
    localStorage.setItem("image-editor-backup", JSON.stringify(images));
  }

  async importFromLocalStorage(): Promise<void> {
    const backup = localStorage.getItem("image-editor-backup");
    if (backup) {
      const images = JSON.parse(backup) as StoredImage[];
      for (const image of images) {
        await this.addImage(image);
      }
    }
  }
}

export const imageDb = new ImageDatabase();
