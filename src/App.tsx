import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./components/ui/input";

import { Button } from "./components/ui/button";
import axios from "axios";
import { useState } from "react";
import { Label } from "./components/ui/label";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Iltimos, ismingizni kamida 2 belgidan iborat qiling" })
    .max(25, {
      message: "Iltimos, ismingizni maksimum 25 belgidan iborat qiling",
    }),
  phone: z
    .string()
    .min(9, {
      message: "Iltimos, telefon raqamingizni kamida 9 belgidan iborat qiling",
    })
    .max(20, {
      message: "Telefon raqamingiz juda uzun, 20 belgidan oshmasligi kerak",
    }),
  carModel: z
    .string()
    .min(1, { message: "Iltimos, avtomobil modelini kiritish majburiy" }),
  vinCode: z.any().optional(),
  sparePart: z.string().optional(),
});

type IForm = z.infer<typeof formSchema>;

function App() {
  // const [isPending, setIsPending] = useState(false);
  const [orderId, setOrderId] = useState("");
  const form = useForm<IForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "+998",
      carModel: "",
      vinCode: null,
      sparePart: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const imageFiles = Array.from(files);
      form.setValue("vinCode", imageFiles[0]);
    }
  };

  const sendDataToTelegram = async (data: IForm) => {
    const { carModel, name, phone, sparePart, vinCode } = data;
    const orderId = "T" + new Date().getTime().toString().slice(-4);
    setOrderId(orderId);
    // setIsPending(true);
    if (vinCode) {
      // If a file is uploaded, use the sendPhoto API
      const telegramPhotoApiUrl =
        "https://api.telegram.org/bot6466187133:AAEyMtB1esNwwydA7JESho36246k_43MZ-E/sendPhoto";
      const photoFormData = new FormData(); // Renamed variable to avoid shadowing

      photoFormData.append("chat_id", "1161180912");
      photoFormData.append("photo", vinCode);
      photoFormData.append(
        "caption",
        `Yangi buyurtma:\n\nPlatforma: Telegram\n\nBuyurtma ID 🆔: ${orderId}\n\nIsmi 👤: ${name}\n\nTelefon raqami 📞: ${phone}\n\nModel 🚗: ${carModel}\n\nKerakli Ehtiyot qisimni: ${sparePart}`
      );

      await axios.post(telegramPhotoApiUrl, photoFormData);
    } else {
      const telegramMessageApiUrl =
        "https://api.telegram.org/bot6466187133:AAEyMtB1esNwwydA7JESho36246k_43MZ-E/sendMessage"; // Replace YOUR_BOT_TOKEN with your actual token
      const message = `Yangi buyurtma:\n\nPlatforma: Telegram\n\nBuyurtma ID 🆔: ${orderId}\n\nIsmi 👤: ${name}\n\nTelefon raqami 📞: ${phone}\n\nModel 🚗: ${carModel}`;

      await axios.post(telegramMessageApiUrl, {
        chat_id: "1161180912",
        text: message,
      });
    }
    // setIsPending(false);
  };

  async function onSubmit(values: IForm) {
    await Promise.all([
      sendDataToTelegram(values),
      sendDataToGoogleSheet(values),
    ]);
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="max-w-[28rem] px-3 w-full">
        {orderId ? (
          <div
            className="flex flex-col gap-y-2 p-5 rounded-md bg-[#ffffff] text-center"
            style={{
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 className="text-2xl font-semibold mb-5">
              Buyurmangiz uchun rahmat!🎉
            </h1>
            <p>
              Buyurtma statusini bilish uchun 10 daqiqadan keyin +998338065555
              telefoniga murojaat qilishingiz, yoki javobimizni kutishingiz
              mumkin.
            </p>
            <p id="orderId">
              Sizning buyurtma raqamingiz:{" "}
              <span id="orderIdValue">{orderId}</span>
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-4 bg-[#ffffff] p-5 rounded-md"
              style={{
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h1 className="text-center text-2xl font-semibold">
                Buyurtma berish
              </h1>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Ism:</FormLabel>
                    <FormControl>
                      <Input placeholder="Asadbek" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>
                      Telefon raqamingizni kiritng:
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="UZ"
                        className="phone-input"
                        placeholder={"+998 95 123 45 67"}
                        value={field.value}
                        onChange={field.onChange}
                        inputComponent={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>
                      Mashingangiz modelini kiritng:
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Tesla Model 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>VIN kodingizni yuklang:</Label>
                <Input
                  type="file"
                  placeholder="xabar..."
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <FormField
                control={form.control}
                name="sparePart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kerakli Ehtiyot qisimni kiritng:</FormLabel>
                    <FormControl>
                      <Input placeholder="Zadniy most" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="py-3 h-auto text-base">
                Yuborish
              </Button>
              {/* <Button
                type="submit"
                className="py-3 h-auto text-base"
                disabled={isPending}
              >
                {isPending ? "Yuborilmoqda..." : "Yuborish"}
              </Button> */}
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

const sendDataToGoogleSheet = async (formDetails: IForm) => {
  const endpointUrl =
    "https://hook.eu2.make.com/g3imut6177rtjyrminqifebh3i7z5vpt";

  await axios.post(endpointUrl, formDetails);
};

export default App;
