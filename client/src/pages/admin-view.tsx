import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppConfig, AppConfigSchema, type AppConfig } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Save, ArrowLeft, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { config, saveConfig } = useAppConfig();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Simple auth check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password is 'admin' for demo purposes
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      toast({
        title: "Invalid Password",
        description: "Try 'admin' for this demo.",
        variant: "destructive"
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
              <Button type="submit" className="w-full">Login</Button>
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

  return <AdminPanel config={config} onSave={saveConfig} onLogout={() => setIsAuthenticated(false)} />;
}

function AdminPanel({ config, onSave, onLogout }: { config: AppConfig, onSave: (c: AppConfig) => void, onLogout: () => void }) {
  const form = useForm<AppConfig>({
    resolver: zodResolver(AppConfigSchema),
    defaultValues: config,
  });

  const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
    control: form.control,
    name: "downloads",
  });

  const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
    control: form.control,
    name: "discounts",
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control,
    name: "socials",
  });
  
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
      control: form.control,
      name: "instructions" as any, // casting due to simple array limitation in react-hook-form types sometimes
  });

  const onSubmit = (data: AppConfig) => {
    onSave(data);
    useToast().toast({
        title: "Changes Saved",
        description: "Your site has been updated.",
    });
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
                <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
                    <Save className="w-4 h-4" /> Save
                </Button>
            </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
                <TabsTrigger value="downloads">Files</TabsTrigger>
                <TabsTrigger value="socials">Socials</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="profile.title"
                      render={({ field }) => (
                        <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile.subtitle"
                      render={({ field }) => (
                        <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profile.avatarUrl"
                      render={({ field }) => (
                        <FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="profile.heroUrl"
                      render={({ field }) => (
                        <FormItem><FormLabel>Hero Background URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Instructions</CardTitle><CardDescription>Steps for your audience to follow</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            {/* Simple array editing for instructions */}
                            {form.watch("instructions").map((_, index) => (
                                <div key={index} className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`instructions.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input {...field} /></FormControl></FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => {
                                        const current = form.getValues("instructions");
                                        form.setValue("instructions", current.filter((_, i) => i !== index));
                                    }}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => {
                                 const current = form.getValues("instructions");
                                 form.setValue("instructions", [...current, "New Step"]);
                             }}><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
                        </div>
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
                         <FormField control={form.control} name={`discounts.${index}.imageUrl`} render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendDiscount({ id: Date.now().toString(), title: "New Offer", description: "Details here", code: "CODE123", ctaLabel: "Shop Now", ctaUrl: "https://", imageUrl: "" })}>
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
                         <FormField control={form.control} name={`downloads.${index}.fileUrl`} render={({ field }) => (<FormItem><FormLabel>Download URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendDownload({ id: Date.now().toString(), title: "New File", description: "File details", fileUrl: "#" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Download
                </Button>
              </TabsContent>

              <TabsContent value="socials" className="space-y-4">
                {socialFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                     <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={() => removeSocial(index)}><Trash2 className="w-4 h-4" /></Button>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name={`socials.${index}.platform`} render={({ field }) => (
                            <FormItem><FormLabel>Platform</FormLabel><FormControl>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...field}>
                                    <option value="twitter">Twitter / X</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="other">Other</option>
                                </select>
                            </FormControl></FormItem>
                         )} />
                         <FormField control={form.control} name={`socials.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                         <FormField control={form.control} name={`socials.${index}.url`} render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={() => appendSocial({ id: Date.now().toString(), platform: "twitter", url: "https://", label: "Follow" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Social Link
                </Button>
              </TabsContent>

            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
