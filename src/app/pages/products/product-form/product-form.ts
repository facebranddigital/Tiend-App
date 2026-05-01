import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

declare var Swal: any;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private storage = inject(Storage);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['In Stock', Validators.required],
      imageUrl: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getProductById(this.productId).subscribe((p) => {
        this.productForm.patchValue(p);
        this.imagePreview = p.imageUrl;
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.productForm.get('imageUrl')?.setValue('pending');
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }
  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.productForm.get('imageUrl')?.setValue('');
  }
  async uploadImage(file: File): Promise<string> {
    const filePath = `products/${Date.now()}_${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const result = await uploadBytes(fileRef, file);
    return await getDownloadURL(result.ref);
  }

  async onSubmit() {
    if (this.productForm.invalid) return;
    this.loading = true;

    try {
      let finalUrl = this.productForm.get('imageUrl')?.value;
      if (this.selectedFile) {
        this.isUploading = true;
        finalUrl = await this.uploadImage(this.selectedFile);
      }

      const productData = { ...this.productForm.value, imageUrl: finalUrl };

      if (this.isEditMode && this.productId) {
        await this.productService.updateProduct(this.productId, productData);
      } else {
        await this.productService.addProduct(productData);
      }

      Swal.fire({
        title: '¡Éxito!',
        text: 'Producto guardado',
        icon: 'success',
        confirmButtonColor: '#ff6b00',
      });
      this.router.navigate(['/products']);
    } catch (e) {
      this.loading = false;
      Swal.fire('Error', 'No se pudo subir la imagen o guardar', 'error');
    }
  }
}
