// client/src/pages/admin-view.tsx

import type React from "react";

import { useToast } from "../hooks/use-toast";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppConfig, AppConfigSchema, type AppConfig } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Trash2, Plus, Save, ArrowLeft, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

import { FileUploader } from "@/components/ui/file-upload";

// ใช้ AppConfig เป็น type ของ form โดยตรง
type FormValues = AppConfig;

type ToastFn = (opts: any) => void;

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const { config, saveConfig } = useAppConfig();
  const [, setLocation] = useLocation();

  const { toast } = useToast(); // ✅ เรียก hook ตรงนี้ครั้งเดียว

  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  if (!envPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-amber-500/50 bg-amber-950/10">
          <CardHeader>
            <CardTitle className="text-amber-500">
              กรุณาตั้งค่ารหัสผ่าน (Setup Required)
            </CardTitle>
            <CardDescription className="text-amber-200/80">
              Admin Password is not configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">
              เพื่อให้หน้าแอดมินใช้งานได้และปลอดภัย กรุณาทำตามขั้นตอน:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-1">
              <li>
                ไปที่ <strong>Tools &gt; Secrets</strong> ใน Replit Editor
              </li>
              <li>
                เพิ่ม Key:{" "}
                <code className="bg-secondary px-1 py-0.5 rounded text-primary">
                  VITE_ADMIN_PASSWORD
                </code>
              </li>
              <li>
                Value: <strong>รหัสผ่านที่คุณต้องการ</strong>
              </li>
              <li>
                จากนั้นกดปุ่ม <strong>Stop</strong> และ <strong>Run</strong>{" "}
                ใหม่เพื่อเริ่มใช้งาน
              </li>
            </ol>
            <div className="mt-4 p-3 bg-secondary/50 rounded text-xs">
              <span className="font-bold text-primary">Note:</span>{" "}
              เนื่องจากข้อจำกัดด้านความปลอดภัยของ Mockup Environment
              จำเป็นต้องใช้ชื่อตัวแปรที่มีคำนำหน้าว่า VITE_
            </div>
            <div className="text-center pt-4">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === envPassword) {
      setIsAuthenticated(true);
    } else {
      toast({
        title: "รหัสผ่านไม่ถูกต้อง",
        description: "Invalid Password",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm border-white/10">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter password to edit content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>

              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-xs text-destructive text-center font-medium">
                  “อย่าใช้รหัสผ่านบัญชีส่วนตัวของคุณ—ตั้งรหัสผ่านเฉพาะสำหรับหน้าแอดมินเท่านั้น”
                </p>
              </div>

              <div className="text-center">
                <Link href="/">
                  <Button variant="link" className="text-muted-foreground">
                    Back to Site
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminPanel
      config={config}
      onSave={saveConfig}
      onLogout={() => setIsAuthenticated(false)}
      toast={toast}
    />
  );
}

function AdminPanel({
  config,
  onSave,
  onLogout,
  toast,
}: {
  config: AppConfig;
  onSave: (c: AppConfig) => void;
  onLogout: () => void;
  toast: ToastFn;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(AppConfigSchema),
    defaultValues: config,
  });

  const {
    fields: downloadFields,
    append: appendDownload,
    remove: removeDownload,
  } = useFieldArray({
    control: form.control,
    name: "downloads",
  });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control: form.control,
    name: "discounts",
  });

  const {
    fields: postFields,
    append: appendPost,
    remove: removePost,
  } = useFieldArray({
    control: form.control,
    name: "posts",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    // ถ้า type ใน AppConfig ยังไม่มี instructions ใช้ any ไปก่อน
    name: "instructions" as any,
  });

  const onSubmit = (data: FormValues) => {
    onSave(data);
    toast({
      title: "บันทึกสำเร็จ",
      description: "เราเซฟ config ให้แล้ว",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <div className="border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Edit Content</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main form */}
      <div className="container max-w-4xl mx-auto p-4 mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="campaign" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
                <TabsTrigger value="downloads">Files</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>

              {/* Campaign */}
              <TabsContent value="campaign" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Info</CardTitle>
                    <CardDescription>
                      Overall details for this promo page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="campaign.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name (Thai/English)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ชื่อแคมเปญ" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="campaign.shareInstruction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Share Instruction</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ทำตามขั้นตอนง่ายๆ เพื่อรับสิทธิพิเศษ"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                    <CardDescription>Detailed steps list</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {(form.watch("instructions") || []).map(
                        (_: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <FormField
                              control={form.control}
                              name={`instructions.${index}` as any}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const current =
                                  form.getValues("instructions") || [];
                                form.setValue(
                                  "instructions" as any,
                                  current.filter(
                                    (_: string, i: number) => i !== index
                                  )
                                );
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("instructions") || [];
                          form.setValue("instructions" as any, [
                            ...current,
                            "New Step",
                          ]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Step
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="profile.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile.avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar</FormLabel>
                          <FormControl>
                            <FileUploader
                              value={field.value}
                              onChange={(url) => field.onChange(url)}
                              label="Upload Avatar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile.heroUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Background</FormLabel>
                          <FormControl>
                            <FileUploader
                              value={field.value}
                              onChange={(url) => field.onChange(url)}
                              label="Upload Hero"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discounts */}
              <TabsContent value="discounts" className="space-y-4">
                {discountFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removeDiscount(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`discounts.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`discounts.${index}.code`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`discounts.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`discounts.${index}.ctaLabel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Label</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`discounts.${index}.ctaUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`discounts.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                              <FileUploader
                                value={field.value || ""}
                                onChange={(url) => field.onChange(url)}
                                label="Upload Banner"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    appendDiscount({
                      id: Date.now().toString(),
                      title: "New Offer",
                      description: "Details here",
                      code: "CODE123",
                      ctaLabel: "Shop Now",
                      ctaUrl: "https://",
                      imageUrl: "",
                    } as any)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Discount Card
                </Button>
              </TabsContent>

              {/* Downloads */}
              <TabsContent value="downloads" className="space-y-4">
                {downloadFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removeDownload(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="pt-6 space-y-4">
                      <FormField
                        control={form.control}
                        name={`downloads.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`downloads.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`downloads.${index}.fileUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File Download</FormLabel>
                            <FormControl>
                              <FileUploader
                                type="file"
                                value={field.value}
                                onChange={(url) => field.onChange(url)}
                                label="Upload File"
                                accept="*"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    appendDownload({
                      id: Date.now().toString(),
                      title: "New File",
                      description: "File details",
                      fileUrl: "#",
                    } as any)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Download
                </Button>
              </TabsContent>

              {/* Posts */}
              <TabsContent value="posts" className="space-y-4">
                {postFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removePost(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`posts.${index}.platform`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                {...field}
                              >
                                <option value="twitter">Twitter / X</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">YouTube</option>
                                <option value="tiktok">TikTok</option>
                                <option value="website">Website</option>
                                <option value="other">Other</option>
                              </select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`posts.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Label</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Share this post"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`posts.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Post URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`posts.${index}.instruction`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instruction (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. Please like and share to support us"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    appendPost({
                      id: Date.now().toString(),
                      platform: "twitter",
                      url: "https://",
                      label: "Share Post",
                      instruction: "",
                    } as any)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Activity Post
                </Button>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
