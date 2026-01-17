import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { PromoConfig } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/ui/file-upload";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

type PromoControl = Control<PromoConfig>;

export function DesignHeaderSection({ control }: { control: PromoControl }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Header Layout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="design.headerLayout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout Style</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="classic" />
                    Classic
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="hero" />
                    Hero
                  </label>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function DesignBackgroundSection({
  control,
  adminPassword,
}: {
  control: PromoControl;
  adminPassword: string;
}) {
  const style = useWatch({ control, name: "design.background.style" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="design.background.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Style</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="solid" />
                    Solid
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="gradient" />
                    Gradient
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="image" />
                    Image
                  </label>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        {(style === "solid" || style === "gradient") && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="design.background.color1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-9 w-16 p-1" {...field} />
                      <Input {...field} />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {style === "gradient" && (
              <FormField
                control={control}
                name="design.background.color2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="h-9 w-16 p-1"
                          value={field.value ?? "#000000"}
                          onChange={field.onChange}
                        />
                        <Input {...field} placeholder="#111111" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
        {style === "image" && (
          <FormField
            control={control}
            name="design.background.imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <FileUploader
                    value={field.value ?? ""}
                    onChange={(url) => field.onChange(url)}
                    label="Upload Background"
                    adminPassword={adminPassword}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function DesignTypographySection({ control }: { control: PromoControl }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="design.typography.titleFont"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title Font</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...field}
                >
                  <option value="Anton">Anton</option>
                  <option value="Inter">Inter</option>
                  <option value="Sans">Sans</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="design.typography.titleColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="h-9 w-16 p-1" {...field} />
                    <Input {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="design.typography.bodyColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="h-9 w-16 p-1" {...field} />
                    <Input {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DesignButtonSection({ control }: { control: PromoControl }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="design.buttons.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Style</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="solid" />
                    Solid
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="outline" />
                    Outline
                  </label>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="design.buttons.backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="h-9 w-16 p-1" {...field} />
                    <Input {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="design.buttons.textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="h-9 w-16 p-1" {...field} />
                    <Input {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="design.buttons.borderRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border Radius (0-32)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={32}
                    step={1}
                    value={[field.value ?? 16]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="text-xs text-muted-foreground">{field.value ?? 16}px</div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function DesignPreview({
  campaign,
  design,
}: {
  campaign: PromoConfig["campaign"];
  design: PromoConfig["design"];
}) {
  const backgroundStyle = getBackgroundStyle(design);
  const titleStyle = {
    color: design.typography.titleColor,
    fontFamily: resolveFontFamily(design.typography.titleFont),
  };
  const bodyStyle = { color: design.typography.bodyColor };
  const buttonStyle = getButtonStyle(design);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-xl border border-white/10 p-4 space-y-3"
          style={backgroundStyle}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20" />
            <div>
              <div className="text-lg font-semibold" style={titleStyle}>
                {campaign.title || "Promo Title"}
              </div>
              <div className="text-sm" style={bodyStyle}>
                {campaign.subtitle || "Subtitle goes here"}
              </div>
            </div>
          </div>
          <button className="w-full py-2 text-sm font-semibold" style={buttonStyle}>
            Primary Button
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function getBackgroundStyle(design: PromoConfig["design"]) {
  const { background } = design;
  if (background.style === "image" && background.imageUrl) {
    return {
      backgroundImage: `url(${background.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (background.style === "gradient") {
    return {
      backgroundImage: `linear-gradient(135deg, ${background.color1}, ${background.color2 ?? background.color1})`,
    };
  }
  return { backgroundColor: background.color1 };
}

function getButtonStyle(design: PromoConfig["design"]) {
  const { buttons } = design;
  if (buttons.style === "outline") {
    return {
      color: buttons.textColor,
      border: `1px solid ${buttons.textColor}`,
      borderRadius: `${buttons.borderRadius}px`,
      backgroundColor: "transparent",
    };
  }
  return {
    color: buttons.textColor,
    backgroundColor: buttons.backgroundColor,
    borderRadius: `${buttons.borderRadius}px`,
  };
}

function resolveFontFamily(font: string) {
  switch (font) {
    case "Anton":
      return "Anton, sans-serif";
    case "Inter":
      return "Inter, sans-serif";
    case "Sans":
      return "ui-sans-serif, system-ui, sans-serif";
    default:
      return font;
  }
}
