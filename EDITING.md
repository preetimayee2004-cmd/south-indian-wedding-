# Invitation mein details aur photos kaise badlein

Saari details ek hi file mein hain: **`src/config/wedding.config.ts`**.
Wahan text badlo, save karo — design apne aap adjust ho jaata hai. Kuch bhi kaat-ta nahi:
lambe naam ya lambi lines apne aap thode chhote ho jaate hain, aur lamba text aane pe
mandir ke khambhe / sheet lambe ho jaate hain.

## Sabse zaroori cheezein

| Kya badalna hai | Config mein kahan |
| --- | --- |
| Mehmaan ka naam ("Dear Preeti") | file ke upar `const guestName = "Preeti";` |
| Dulha / dulhan ke naam | `couple.bride.name`, `couple.groom.name` |
| Shaadi ki tareekh aur samay (countdown isi se chalta hai) | `wedding.dateISO`, `wedding.muhurthamLabel` |
| Shehar | `wedding.city` |
| Venue (invitation card) | `venue.name`, `venue.address`, `venue.mapsQuery` |
| Events (Nalangu, Mehendi…) | `events: [ … ]` — har event mein `name`, `subtitle`, `startISO`, `endISO`, `venue`, `dressCode`, `dressColors`, `description` |
| Photo board ("Moments to Cherish") | `gallery.heading`, `gallery.photos`, `gallery.ending` (neeche dekho) |
| Parivaar, contacts, RSVP ki aakhri tareekh | `family`, `contacts`, `rsvp.deadlineISO` |

Tareekh hamesha is format mein likho: `"2027-02-15T07:00:00+05:30"` (saal-mahina-din, phir samay, phir India ka time zone).

Kisi ek mehmaan ke liye link: site ke link ke aage `?guest=Naam` lagao, jaise `…/?guest=Anita`.

## Photo board ("Moments to Cherish")

1. Apni photos `public/media/gallery/` folder mein daalo (WebP sabse achha; JPG/PNG bhi chalega).
   Square ya lagbhag square photos sabse sundar dikhti hain; koi bhi size chalega — photo frame mein apne aap fit hoti hai.
2. `wedding.config.ts` mein `gallery.photos` list mein har photo ki ek line:
   ```ts
   { src: "/media/gallery/meri-photo.webp", caption: "Where it all began", alt: "Hum dono, pehli mulaqat" },
   ```
3. Zyada se zyada **6 photos** board pe aati hain, list ke order mein. Kam photos bhi chalegi.

Abhi wahan example couple photos hain — apni photos usi naam se rakh do (photo-1.webp … photo-6.webp), ya list badal do. Heading aur captions bhi yahin se badlo — love story na ho to bhi chalega (jaise "When our families said yes", "Nichayathartham, the engagement").

## Check aur publish

```bash
npm run dev
```
Browser mein site khulegi; phone size pe bhi dekh lo. Sab theek ho to:
```bash
git add -A && git commit -m "Update details" && git push
```
