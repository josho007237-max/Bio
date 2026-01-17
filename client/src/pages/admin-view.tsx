import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppConfig, PromoConfigSchema } from "@/lib/store";
import type { PromoConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Save, ArrowLeft, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/ui/file-upload";
import {
  DesignBackgroundSection,
  DesignButtonSection,
  DesignHeaderSection,
  DesignPreview,
  DesignTypographySection,
} from "@/components/admin/design-sections";

type AudienceEntry = {
  timestamp: string;
  email: string;
  name?: string;
  campaign?: string;
  source?: string;
  notes?: string;
};

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { config, setConfig, isLoading } = useAppConfig();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "กรุณากรอกรหัสผ่าน",
        description: "Password is required",
        variant: "destructive"
      });
      return;
    }
    setIsAuthenticated(true);
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
              <Button type="submit" className="w-full">Login</Button>
              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                 <p className="text-xs text-destructive text-center font-medium">
                   “อย่าใช้รหัสผ่านบัญชีส่วนตัวของคุณ—ตั้งรหัสผ่านเฉพาะสำหรับหน้าแอดมินเท่านั้น”
                 </p>
              </div>
              <div className="text-center">
                <Link href="/">
                  <Button variant="link" className="text-muted-foreground">Back to Site</Button>
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
      onSave={async (data) => {
        try {
          const response = await fetch("/api/config", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": password,
            },
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            throw new Error(`Save failed: ${response.status}`);
          }
          const saved = (await response.json()) as PromoConfig;
          setConfig(saved);
          toast({
            title: "Changes Saved",
            description: "Your site has been updated.",
          });
        } catch (error) {
          toast({
            title: "Save failed",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      }}
      onLogout={() => setIsAuthenticated(false)}
      adminPassword={password}
      isLoading={isLoading}
    />
  );
}

function AdminPanel({
  config,
  onSave,
  onLogout,
  adminPassword,
  isLoading,
}: {
  config: PromoConfig;
  onSave: (c: PromoConfig) => void;
  onLogout: () => void;
  adminPassword: string;
  isLoading: boolean;
}) {
  const form = useForm<PromoConfig>({
    resolver: zodResolver(PromoConfigSchema),
    defaultValues: config,
  });

  const [activeDesignSection, setActiveDesignSection] = useState<
    "header" | "background" | "typography" | "buttons"
  >("header");
  const [audienceEntries, setAudienceEntries] = useState<AudienceEntry[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);

  const fetchAudience = async () => {
    setAudienceLoading(true);
    try {
      const response = await fetch("/api/audience");
      const data = (await response.json()) as AudienceEntry[];
      const enabled = response.headers.get("x-google-sheets-enabled") === "true";
      setGoogleSheetsEnabled(enabled);
      setAudienceEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load audience", error);
    } finally {
      setAudienceLoading(false);
    }
  };

  useEffect(() => {
    form.reset(config);
  }, [config, form]);

  useEffect(() => {
    void fetchAudience();
  }, []);

  const formattedAudience = useMemo(
    () =>
      audienceEntries.map((entry) => ({
        ...entry,
        displayTime: new Date(entry.timestamp).toLocaleString(),
      })),
    [audienceEntries],
  );

  const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
    control: form.control,
    name: "downloads",
  });

  const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
    control: form.control,
    name: "discounts",
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "campaign.steps",
  });

  const onSubmit = (data: PromoConfig) => {
    onSave(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                </Link>
                <h1 className="text-xl font-bold">Edit Content</h1>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
                <Button onClick={form.handleSubmit(onSubmit)} className="gap-2" disabled={isLoading}>
                    <Save className="w-4 h-4" /> Save
                </Button>
            </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="campaign" className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-8">
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
                <TabsTrigger value="downloads">Files</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
              </TabsList>

              <TabsContent value="campaign" className="space-y-6">
                 <Card>
                  <CardHeader><CardTitle>Campaign Info</CardTitle><CardDescription>Overall details for this promo page</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                      control={form.control}
                      name="campaign.title"
                      render={({ field }) => (
                        <FormItem><FormLabel>Campaign Title</FormLabel><FormControl><Input {...field} placeholder="ชื่อแคมเปญ" /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="campaign.subtitle"
                      render={({ field }) => (
                        <FormItem><FormLabel>Campaign Subtitle</FormLabel><FormControl><Input {...field} placeholder="คำอธิบายสั้น ๆ" /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Instructions</CardTitle><CardDescription>Detailed steps list</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            {stepFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`campaign.steps.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input {...field} /></FormControl></FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => {
                                 appendStep("New Step");
                             }}><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="campaign.avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avatar</FormLabel>
                            <FormControl>
                                <FileUploader 
                                    value={field.value ?? ""} 
                                    onChange={(url) => field.onChange(url)} 
                                    label="Upload Avatar"
                                    adminPassword={adminPassword}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="campaign.heroUrl"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hero Background</FormLabel>
                            <FormControl>
                                <FileUploader 
                                    value={field.value ?? ""} 
                                    onChange={(url) => field.onChange(url)} 
                                    label="Upload Hero"
                                    adminPassword={adminPassword}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discounts" className="space-y-4">
                {discountFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={() => removeDiscount(index)}><Trash2 className="w-4 h-4" /></Button>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`discounts.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name={`discounts.${index}.code`} render={({ field }) => (<FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        </div>
                        <FormField control={form.control} name={`discounts.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`discounts.${index}.ctaLabel`} render={({ field }) => (<FormItem><FormLabel>Button Label</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name={`discounts.${index}.ctaUrl`} render={({ field }) => (<FormItem><FormLabel>Button URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
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
                                            adminPassword={adminPassword}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} 
                         />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendDiscount({ id: Date.now().toString(), title: "New Offer", description: "", code: "CODE123", ctaLabel: "", ctaUrl: "", imageUrl: "" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Discount Card
                </Button>
              </TabsContent>

              <TabsContent value="downloads" className="space-y-4">
                 {downloadFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={() => removeDownload(index)}><Trash2 className="w-4 h-4" /></Button>
                    <CardContent className="pt-6 space-y-4">
                         <FormField control={form.control} name={`downloads.${index}.title`} render={({ field }) => (<FormItem><FormLabel>File Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                         <FormField control={form.control} name={`downloads.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                         <FormField 
                            control={form.control} 
                            name={`downloads.${index}.downloadUrl`} 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File Download</FormLabel>
                                    <FormControl>
                                        <FileUploader 
                                            type="file"
                                            value={field.value || ""} 
                                            onChange={(url) => field.onChange(url)} 
                                            label="Upload File"
                                            accept="*"
                                            adminPassword={adminPassword}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} 
                         />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendDownload({ id: Date.now().toString(), title: "New File", description: "", downloadUrl: "" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Download
                </Button>
              </TabsContent>

              <TabsContent value="posts" className="space-y-4">
                {activityFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                     <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={() => removeActivity(index)}><Trash2 className="w-4 h-4" /></Button>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name={`activities.${index}.platform`} render={({ field }) => (
                            <FormItem><FormLabel>Platform</FormLabel><FormControl>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...field}>
                                    <option value="x">Twitter / X</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="web">Website</option>
                                </select>
                            </FormControl></FormItem>
                         )} />
                         <FormField control={form.control} name={`activities.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Action Label</FormLabel><FormControl><Input {...field} placeholder="e.g. Share this post" /></FormControl></FormItem>)} />
                         <FormField control={form.control} name={`activities.${index}.url`} render={({ field }) => (<FormItem><FormLabel>Post URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                         <div className="md:col-span-3">
                            <FormField control={form.control} name={`activities.${index}.instruction`} render={({ field }) => (<FormItem><FormLabel>Instruction (Optional)</FormLabel><FormControl><Input {...field} placeholder="e.g. Please like and share to support us" /></FormControl></FormItem>)} />
                         </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendActivity({ id: Date.now().toString(), platform: "x", url: "https://", label: "Share Post", instruction: "" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Activity Post
                </Button>
              </TabsContent>

              <TabsContent value="design" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Design Menu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        type="button"
                        variant={activeDesignSection === "header" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveDesignSection("header")}
                      >
                        Header
                      </Button>
                      <Button
                        type="button"
                        variant={activeDesignSection === "background" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveDesignSection("background")}
                      >
                        Background
                      </Button>
                      <Button
                        type="button"
                        variant={activeDesignSection === "typography" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveDesignSection("typography")}
                      >
                        Text
                      </Button>
                      <Button
                        type="button"
                        variant={activeDesignSection === "buttons" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveDesignSection("buttons")}
                      >
                        Buttons
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <DesignPreview
                      campaign={form.watch("campaign")}
                      design={form.watch("design")}
                    />
                    {activeDesignSection === "header" && (
                      <DesignHeaderSection control={form.control} />
                    )}
                    {activeDesignSection === "background" && (
                      <DesignBackgroundSection
                        control={form.control}
                        adminPassword={adminPassword}
                      />
                    )}
                    {activeDesignSection === "typography" && (
                      <DesignTypographySection control={form.control} />
                    )}
                    {activeDesignSection === "buttons" && (
                      <DesignButtonSection control={form.control} />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Events</CardTitle>
                    <CardDescription>Latest subscribers captured by your promo page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {formattedAudience.length} entries
                      </div>
                      <Button type="button" variant="outline" onClick={fetchAudience} disabled={audienceLoading}>
                        {audienceLoading ? "Refreshing..." : "Refresh"}
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white/5 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Timestamp</th>
                            <th className="px-3 py-2 text-left font-medium">Email</th>
                            <th className="px-3 py-2 text-left font-medium">Name</th>
                            <th className="px-3 py-2 text-left font-medium">Campaign</th>
                            <th className="px-3 py-2 text-left font-medium">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formattedAudience.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                                No audience entries yet.
                              </td>
                            </tr>
                          )}
                          {formattedAudience.map((entry) => (
                            <tr key={`${entry.timestamp}-${entry.email}`} className="border-t border-white/5">
                              <td className="px-3 py-2">{entry.displayTime}</td>
                              <td className="px-3 py-2">{entry.email}</td>
                              <td className="px-3 py-2">{entry.name || "-"}</td>
                              <td className="px-3 py-2">{entry.campaign || "-"}</td>
                              <td className="px-3 py-2">{entry.source || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Google Sheets Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      Status:{" "}
                      <span className={googleSheetsEnabled ? "text-emerald-400" : "text-amber-400"}>
                        {googleSheetsEnabled ? "Enabled" : "Not configured"}
                      </span>
                    </div>
                    <p>
                      สร้าง Google Apps Script webhook ที่รับ JSON แล้วเขียนลง Sheet จากนั้นนำ URL มาใส่ใน env{" "}
                      <code className="rounded bg-secondary px-1 py-0.5 text-primary">GOOGLE_SHEETS_WEBHOOK_URL</code>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
