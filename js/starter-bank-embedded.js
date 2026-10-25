// AUTO-GENERATED from data/starter-bank.json by tools/sync-bank.js — do not edit by hand.
// After editing data/starter-bank.json, run: npm run sync-bank
(function (root) {
  "use strict";
  var BANK = {
  "schemaVersion": 1,
  "id": "starter-core-fundamentals",
  "name": "NCLEX-Style Starter Bank — Core Fundamentals",
  "version": "1.0.0",
  "description": "A free, education-only starter bank of single-best-answer questions on widely published fundamentals: hygiene, infection control, safety, medication checks, assessment ranges, patient education, and delegation. Built for self-study and review; always confirm practice details against your facility's current policies and authoritative sources.",
  "exam": {
    "passPct": 75,
    "minutes": 45
  },
  "questions": [
    {
      "id": "ic-01",
      "category": "Infection Control",
      "difficulty": "easy",
      "question": "When performing routine hand hygiene with soap and water, how long should you lather and scrub all surfaces of the hands?",
      "choices": [
        "At least 5 seconds",
        "At least 10 seconds",
        "At least 20 seconds",
        "At least 60 seconds"
      ],
      "answerIndex": 2,
      "explanation": "Published hand-hygiene guidance for healthcare settings, including the CDC's, recommends lathering with soap and water for at least 20 seconds, covering all hand surfaces, before rinsing. Alcohol-based hand rub is the usual routine choice when hands are not visibly soiled, but soap and water is required when hands are visibly dirty or contaminated.",
      "references": [
        "CDC: Hand Hygiene in Healthcare Settings (public guidance)"
      ]
    },
    {
      "id": "ic-02",
      "category": "Infection Control",
      "difficulty": "medium",
      "question": "For which of the following clients should you choose soap-and-water hand washing instead of alcohol-based hand rub, even when hands are not visibly soiled?",
      "choices": [
        "A client receiving routine morning care",
        "A client with C. difficile infection",
        "A client on airborne precautions",
        "A client on droplet precautions"
      ],
      "answerIndex": 1,
      "explanation": "C. difficile forms spores that resist the alcohol in hand rubs, so soap and water, with friction and rinsing, is the effective choice after caring for a client with C. diff. Gloves are still worn, but glove use never replaces hand hygiene.",
      "references": [
        "CDC: C. difficile and hand hygiene (public guidance)"
      ]
    },
    {
      "id": "ic-03",
      "category": "Infection Control",
      "difficulty": "medium",
      "question": "You are removing personal protective equipment after finishing care on a client in isolation. Which item should be removed FIRST?",
      "choices": [
        "Gown",
        "Gloves",
        "N95 respirator",
        "Goggles or face shield"
      ],
      "answerIndex": 1,
      "explanation": "The most contaminated item, the gloves, comes off first, followed by eye protection, then the gown, then the mask or respirator, with hand hygiene after removal. Removing gloves first reduces the chance of transferring contamination to uncovered skin or clothing. Follow your facility's posted donning and doffing procedure.",
      "references": [
        "CDC: Sequence for Removing PPE (public guidance)"
      ]
    },
    {
      "id": "ic-04",
      "category": "Infection Control",
      "difficulty": "easy",
      "question": "When putting on personal protective equipment in the standard sequence, which item goes on LAST?",
      "choices": [
        "Gown",
        "Mask or respirator",
        "Eye protection",
        "Gloves"
      ],
      "answerIndex": 3,
      "explanation": "The standard sequence is gown first, then mask or respirator, then eye protection, and gloves last, so the gloves cover the gown cuffs and create a continuous protected surface. Facsimile posters in most facilities reinforce exactly this order.",
      "references": [
        "CDC: Sequence for Putting On PPE (public guidance)"
      ]
    },
    {
      "id": "ic-05",
      "category": "Infection Control",
      "difficulty": "easy",
      "question": "A client has confirmed influenza with coughing and sneezing. Which precautions match this situation?",
      "choices": [
        "Airborne precautions with a required fit-tested N95 respirator",
        "Droplet precautions, including a surgical mask and eye protection when caring within close range",
        "Contact precautions only; no mask is needed",
        "No precautions beyond standard precautions"
      ],
      "answerIndex": 1,
      "explanation": "Influenza is spread primarily by large respiratory droplets, so droplet precautions apply: a surgical mask when within about 6 feet of the client, plus eye protection during care that risks splashes. Diseases such as tuberculosis, measles, and varicella require airborne precautions with an N95 respirator.",
      "references": [
        "CDC: Transmission-based precautions (public guidance)"
      ]
    },
    {
      "id": "ic-06",
      "category": "Infection Control",
      "difficulty": "medium",
      "question": "A hospitalized client is suspected of having active pulmonary tuberculosis. Which respirator should you wear during direct, close care of this client?",
      "choices": [
        "Standard surgical mask",
        "N95 respirator, properly fit tested",
        "Face shield only",
        "No respirator is required once treatment has started"
      ],
      "answerIndex": 1,
      "explanation": "Tuberculosis spreads through small airborne particles, so a fit-tested N95 respirator is recommended for staff entering the client's room along with airborne isolation practices. A surgical mask protects others from the wearer's droplets but does not protect the wearer from inhaling small airborne particles.",
      "references": [
        "CDC: Airborne precautions and tuberculosis (public guidance)"
      ]
    },
    {
      "id": "ic-07",
      "category": "Infection Control",
      "difficulty": "easy",
      "question": "After removing gloves following perineal care of a single client, when should hand hygiene be performed?",
      "choices": [
        "Only if the gloves were visibly torn",
        "Immediately after removing the gloves, even when they look and feel intact",
        "At the end of the shift",
        "Only once the nurse moves to the next client"
      ],
      "answerIndex": 1,
      "explanation": "Hand hygiene is performed immediately after glove removal, every time. Gloves can have microscopic holes or carry contamination on removal, and cleaning immediately after gloves is one of the consistently taught moments for hand hygiene in healthcare work.",
      "references": [
        "WHO: 5 moments for hand hygiene (public guidance)"
      ]
    },
    {
      "id": "saf-01",
      "category": "Safety",
      "difficulty": "easy",
      "question": "A fire starts in a client's room. Using the RACE sequence, what is the first step?",
      "choices": [
        "Extinguish the fire",
        "Rescue or remove anyone in immediate danger",
        "Activate the fire alarm",
        "Confine the fire by closing doors"
      ],
      "answerIndex": 1,
      "explanation": "RACE stands for Rescue anyone in immediate danger, Activate the alarm, Confine the fire, and Extinguish or Evacuate as appropriate. People come first: protecting clients and staff who are in immediate danger precedes the alarm, containment, and firefighting steps. Follow your facility's fire response plan.",
      "references": [
        "Standard RACE fire-response sequence (public safety education)"
      ]
    },
    {
      "id": "saf-02",
      "category": "Safety",
      "difficulty": "easy",
      "question": "When using a portable fire extinguisher with the PASS sequence, what does the A instruct you to do?",
      "choices": [
        "Alert others in the area",
        "Aim low, pointing the nozzle at the base of the fire",
        "Activate the alarm",
        "Advance toward the fire"
      ],
      "answerIndex": 1,
      "explanation": "PASS is Pull the pin, Aim low at the base of the fire, Squeeze the handle, and Sweep side to side. Aiming at the base directs the extinguishing agent where it stops the fire rather than into the smoke.",
      "references": [
        "Standard PASS extinguisher sequence (public safety education)"
      ]
    },
    {
      "id": "saf-03",
      "category": "Safety",
      "difficulty": "medium",
      "question": "Which statement best reflects home-oxygen safety teaching for a client returning home on oxygen?",
      "choices": [
        "Keep oxygen away from open flames, heat sources, and anyone smoking",
        "Route oxygen tubing under rugs to keep walkways tidy",
        "If the tank valve is closed, smoking in the same room is safe",
        "Store cylinders lying flat behind the door"
      ],
      "answerIndex": 0,
      "explanation": "Oxygen supports combustion, so flames, heat sources, and smoking are kept away from oxygen equipment. Tubing should not run under rugs or doorways, cylinders are secured upright, and the home care company or facility policy gives the exact clearances for the client's setup.",
      "references": [
        "Public home-oxygen safety education"
      ]
    },
    {
      "id": "saf-04",
      "category": "Safety",
      "difficulty": "medium",
      "question": "While assisting an unsteady older adult to stand, the client begins sliding toward the floor. What is the safest action?",
      "choices": [
        "Grip the client firmly under the arms and hold them upright at all costs",
        "Step back to a safe distance, let the client fall, and then call for help",
        "Protect the client's head, guide the descent in a controlled lower to the floor, and call for help",
        "Push the client back onto the bed from a short distance away"
      ],
      "answerIndex": 2,
      "explanation": "Trying to fully arrest a fall can injure the client or the helper, so the widely taught technique is to protect the head and control the descent, easing the client carefully to the floor, then assess, call for help, and follow your facility's fall protocol, including documentation and reporting.",
      "references": [
        "Standard safe client-handling education"
      ]
    },
    {
      "id": "med-01",
      "category": "Medication Safety",
      "difficulty": "easy",
      "question": "Which of the following is NOT one of the standard rights of medication administration?",
      "choices": [
        "Right patient",
        "Right dose",
        "Right time",
        "Right brand"
      ],
      "answerIndex": 3,
      "explanation": "The classically taught rights include right patient, right drug, right dose, right route, and right time, with documentation often added as a sixth. Brand is not one of them; the check is the correct prescribed medication, whether the order names a generic or brand product.",
      "references": [
        "Standard medication-rights teaching (public)"
      ]
    },
    {
      "id": "med-02",
      "category": "Medication Safety",
      "difficulty": "easy",
      "question": "Before administering a medication, what is the appropriate way to verify you have the right client?",
      "choices": [
        "Ask the client's name once and proceed if the answer sounds right",
        "Check the medication cart label only",
        "Use two identifiers, such as full name and date of birth, checked against the medication record and the client's ID band",
        "Ask a family member in the room to confirm the client's identity"
      ],
      "answerIndex": 2,
      "explanation": "The widely published standard is at least two client identifiers drawn from the ID band and matched to the medication administration record, before every dose. This protects clients who are drowsy, confused, hard of hearing, or unable to speak.",
      "references": [
        "Joint Commission: two-identifier requirement (public)"
      ]
    },
    {
      "id": "med-03",
      "category": "Medication Safety",
      "difficulty": "medium",
      "question": "A colleague proposes giving a dose of potassium chloride by IV push. What is the correct response?",
      "choices": [
        "Push 10 mEq and monitor the client closely",
        "No: IV potassium must be diluted and infused slowly; it is never given by IV push",
        "Push it only if the client's level is critically low",
        "Push it only when a rapid-response team is at the bedside"
      ],
      "answerIndex": 1,
      "explanation": "IV potassium given as a rapid push can cause serious, life-threatening cardiac arrhythmias. Safety guidance requires potassium to be diluted and infused slowly over the ordered time, usually with a pump, through a freely running line. Facility policy sets exact concentrations and rates.",
      "references": [
        "ISMP and pharmacology teaching: never IV push potassium (public)"
      ]
    },
    {
      "id": "med-04",
      "category": "Medication Safety",
      "difficulty": "medium",
      "question": "Following widely taught practice, what should the nurse assess before each digoxin dose in an adult, and when should the dose be held?",
      "choices": [
        "Apical pulse for one full minute; hold the dose and notify the prescriber if the apical rate is below 60/min",
        "Radial pulse for 15 seconds; hold the dose if the rate is above 100/min",
        "Blood pressure only; the pulse does not need checking",
        "Apical rate only, without note of regularity, and give the dose regardless"
      ],
      "answerIndex": 0,
      "explanation": "Classic digoxin teaching calls for an apical pulse taken for one full minute before each dose, with the dose held and the prescriber notified when an adult's apical rate is below 60/min or other expected changes are present. Facility-specific protocols may adjust exact thresholds.",
      "references": [
        "Standard digoxin administration teaching (public)"
      ]
    },
    {
      "id": "med-05",
      "category": "Medication Safety",
      "difficulty": "medium",
      "question": "Which tablet form should NOT be crushed?",
      "choices": [
        "A scored immediate-release tablet",
        "A caplet",
        "An enteric-coated tablet",
        "A film-coated immediate-release tablet approved for crushing by the pharmacist"
      ],
      "answerIndex": 2,
      "explanation": "Enteric coatings keep a tablet intact through stomach acid (and sometimes protect the stomach) and can control where the drug releases; crushing destroys that design. If swallowing is difficult, ask the pharmacist for an appropriate liquid or alternative route instead.",
      "references": [
        "Standard tablet-form and crushing guidance (public)"
      ]
    },
    {
      "id": "med-06",
      "category": "Medication Safety",
      "difficulty": "easy",
      "question": "On day 4 of a 7-day oral antibiotic course, a client feels much better and wants to save the remaining capsules. What is the best teaching response?",
      "choices": [
        "Stop the antibiotic, since improvement means the infection is gone",
        "Finish the full course exactly as prescribed, even when feeling better",
        "Save the remaining capsules for the next illness",
        "Double the remaining doses to finish the course sooner"
      ],
      "answerIndex": 1,
      "explanation": "Public antibiotic guidance asks clients to complete the prescribed course so the infection clears and resistance risk falls. Leftover antibiotics are not saved or shared, and doses are never doubled or held without prescriber direction.",
      "references": [
        "CDC: antibiotic use education (public)"
      ]
    },
    {
      "id": "ass-01",
      "category": "Assessment",
      "difficulty": "medium",
      "question": "Where is the apical pulse best auscultated in an adult?",
      "choices": [
        "At the 5th intercostal space in the left midclavicular line",
        "At the 2nd intercostal space on the right sternal border",
        "In the left axilla at the 4th interspace",
        "Just above the umbilicus"
      ],
      "answerIndex": 0,
      "explanation": "The point of maximal impulse, where the apical pulse is auscultated, sits in the 5th intercostal space along the left midclavicular line in most adults. Count the apical rate for a full minute whenever accuracy matters, such as before certain cardiac medications.",
      "references": [
        "Standard physical-assessment teaching (public)"
      ]
    },
    {
      "id": "ass-02",
      "category": "Assessment",
      "difficulty": "easy",
      "question": "What is the widely accepted normal respiratory rate range for a resting adult?",
      "choices": [
        "8 to 12 breaths/min",
        "12 to 20 breaths/min",
        "20 to 28 breaths/min",
        "28 to 35 breaths/min"
      ],
      "answerIndex": 1,
      "explanation": "Most clinical references list a normal resting adult respiratory rate of about 12 to 20 breaths per minute. A rate outside this range deserves reassessment, and persistent or worsening abnormalities are reported promptly per your unit's protocols.",
      "references": [
        "Standard vital-sign reference ranges (public)"
      ]
    },
    {
      "id": "ass-03",
      "category": "Assessment",
      "difficulty": "easy",
      "question": "Which resting heart rate range is widely accepted as normal for an adult?",
      "choices": [
        "40 to 60 beats/min",
        "60 to 100 beats/min",
        "100 to 140 beats/min",
        "140 to 180 beats/min"
      ],
      "answerIndex": 1,
      "explanation": "The widely taught normal adult resting heart rate is about 60 to 100 beats per minute. Trained endurance athletes may run lower, and a rate by itself never replaces assessment of perfusion, symptoms, and trend.",
      "references": [
        "Standard vital-sign reference ranges (public)"
      ]
    },
    {
      "id": "ass-04",
      "category": "Assessment",
      "difficulty": "medium",
      "question": "Which oral temperature reading falls within the widely accepted typical adult range?",
      "choices": [
        "36.5 to 37.5 °C (about 97.7 to 99.5 °F)",
        "38.0 to 38.9 °C",
        "35.0 to 35.9 °C",
        "39.0 to 40.0 °C"
      ],
      "answerIndex": 0,
      "explanation": "Typical oral body temperature is roughly 36.5 to 37.5 °C (about 97.7 to 99.5 °F), with normal variation by person, route, and time of day. The other options describe fever, low temperature, and high fever. Follow your facility's thresholds for what to report and how to act.",
      "references": [
        "Standard vital-sign reference ranges (public)"
      ]
    },
    {
      "id": "ass-05",
      "category": "Assessment",
      "difficulty": "medium",
      "question": "An older adult's skin turgor is being assessed. Which site gives the most reliable result?",
      "choices": [
        "The dorsum of the hand",
        "The sternum or inner forearm",
        "Over the shin",
        "Over the ankle"
      ],
      "answerIndex": 1,
      "explanation": "Skin loses elasticity with aging, so the hand and other thin-skinned areas can show false tenting in older adults. The sternum or inner forearm is usually the more reliable check. Turgor is one clue only; pair it with mucous membranes, intake and output, and the client's history.",
      "references": [
        "Standard physical-assessment teaching (public)"
      ]
    },
    {
      "id": "ass-06",
      "category": "Assessment",
      "difficulty": "medium",
      "question": "For a typical adult, which hourly urine output is generally treated as the minimum acceptable amount?",
      "choices": [
        "10 mL/hr",
        "30 mL/hr",
        "75 mL/hr",
        "150 mL/hr"
      ],
      "answerIndex": 1,
      "explanation": "The common adult benchmark is about 0.5 mL/kg/hr, which is roughly 30 mL/hr for many adults. Output consistently below this deserves reassessment and reporting along with the client's whole fluid picture. Infants and small children are assessed per kilogram instead.",
      "references": [
        "Standard fluid-balance teaching (public)"
      ]
    },
    {
      "id": "fun-01",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "Which option best reflects proper body mechanics when moving a heavy object?",
      "choices": [
        "Bend at the waist and hold the object away from the body",
        "Keep the load close to the body, bend the knees, and lift with the leg and hip muscles",
        "Twist the torso while lifting to reach the far side of the bed",
        "Lift abruptly, then pause to adjust your footing"
      ],
      "answerIndex": 1,
      "explanation": "Good body mechanics use a wide base of support, bent knees, the load held close to the body's midline, and power from the legs and hips rather than the back. Twisting and reaching increase strain; face the load and step to turn instead.",
      "references": [
        "Standard safe client-handling education (public)"
      ]
    },
    {
      "id": "fun-02",
      "category": "Fundamentals",
      "difficulty": "easy",
      "question": "Which room setup best supports fall prevention for a client who uses the bedside commode at night?",
      "choices": [
        "All four side rails raised and the bed kept high",
        "Bed in the lowest working position with wheels locked, call light within reach, non-slip footwear, and a clear, lit walkway",
        "Call light put away so it does not clutter the bedside",
        "Room lights left off and no routine check so the client builds independence"
      ],
      "answerIndex": 1,
      "explanation": "Typical fall-prevention practice keeps the bed low with wheels locked, the call light in reach, non-slip footwear on, clutter cleared, and adequate lighting. Raised side rails all around are not a safe solution and may be restricted under facility policy.",
      "references": [
        "Standard inpatient fall-prevention teaching (public)"
      ]
    },
    {
      "id": "fun-03",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "Which chart entry is the best example of appropriate documentation?",
      "choices": [
        "“Client is behaving badly and needs a sitter.”",
        "“Client had a good night. Slept well.”",
        "“Client reports pain 7/10 at rest. Offered PRN analgesic; client declined. Breathing unlabored; skin warm and dry. Offered comfort measures.”",
        "“Client seems anxious about surgery.”"
      ],
      "answerIndex": 2,
      "explanation": "Good documentation is objective, timely, and behavior-based: it quotes the client's own words where relevant, records observations and the actions taken, and avoids labels or judgments. Subjective experiences are attributed to the client; the nurse's own opinions are not written as fact.",
      "references": [
        "Standard documentation education (public)"
      ]
    },
    {
      "id": "fun-04",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "In general prevention teaching, how often is a bed- or chair-bound client commonly repositioned, in the absence of individualized schedules?",
      "choices": [
        "Once per shift",
        "At least about every 2 hours, and sooner if skin shows pressure signs or the client is uncomfortable",
        "Only when the client starts to complain of pain",
        "Only after any break in the skin appears"
      ],
      "answerIndex": 1,
      "explanation": "Widely published pressure-injury prevention teaching calls for repositioning at least about every 2 hours in bed or chair, individualized by risk and condition, combined with a skin check at each turn and documentation per your facility's schedule.",
      "references": [
        "Standard pressure-injury prevention education (public)"
      ]
    },
    {
      "id": "fun-05",
      "category": "Fundamentals",
      "difficulty": "easy",
      "question": "Which description best fits correct incentive-spirometry technique?",
      "choices": [
        "Exhale forcefully and rapidly into the device",
        "Sit upright, inhale slowly and deeply, hold the breath a few seconds, then exhale fully and follow with a cough",
        "Take several quick shallow sips of air and avoid coughing",
        "Use it while fully reclined with the head flat on the pillow"
      ],
      "answerIndex": 1,
      "explanation": "Incentive spirometry encourages slow, deep breaths with a brief breath-hold, followed by a productive cough; it is commonly used after surgery to keep airways clear and lungs expanded. Sitting upright works better than lying flat.",
      "references": [
        "Standard postoperative breathing-exercise education (public)"
      ]
    },
    {
      "id": "fun-06",
      "category": "Fundamentals",
      "difficulty": "hard",
      "question": "Which statement about restraints is consistent with widely published regulation-based teaching?",
      "choices": [
        "A nurse may restrain any client who pulls at medical devices, without a provider order",
        "Restraints are the least restrictive option, require a provider order (obtained as soon as possible in emergencies), and require frequent monitoring and documentation",
        "Restraints may be tied securely to the side rails",
        "Restraints may be used for staff convenience to prevent wandering"
      ],
      "answerIndex": 1,
      "explanation": "Restraints are a last resort, applied with the least restrictive method, requiring provider orders (obtained as soon as possible during emergencies) plus scheduled monitoring of circulation, skin, and needs, with documentation. Restraints are never used for staff convenience. Facility policies set exact order, check, and time-limit requirements.",
      "references": [
        "CMS restraint requirements summarized in public nursing education"
      ]
    },
    {
      "id": "fun-07",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "Before surgery, who is responsible for explaining the procedure, its risks, and alternatives to the client?",
      "choices": [
        "The nurse, who also answers all clinical questions about the procedure alone",
        "The provider performing the procedure; the nurse may witness the signed consent and confirm the client has no remaining questions",
        "Any adult family member available in the room",
        "Verbal consent is acceptable for surgical procedures"
      ],
      "answerIndex": 1,
      "explanation": "The clinician performing the procedure explains its nature, risks, benefits, and alternatives and answers questions, because informed consent rests on their explanation. The nurse commonly verifies understanding and witnesses the signature; if the client still has questions, the nurse withholds signing and contacts the provider. Facility policy defines the exact roles.",
      "references": [
        "Standard informed-consent teaching (public)"
      ]
    },
    {
      "id": "fun-08",
      "category": "Fundamentals",
      "difficulty": "easy",
      "question": "Two colleagues are discussing a client's diagnosis in a crowded hospital elevator. What is the appropriate action?",
      "choices": [
        "Keep talking quietly, since elevators are effectively private",
        "Stop the conversation and resume somewhere private; protected health information does not belong in public spaces",
        "Continue, but switch to using the client's first name only",
        "Continue briefly, until both colleagues step out at the next stop"
      ],
      "answerIndex": 1,
      "explanation": "Privacy guidance treats elevator and hallway conversations about identifiable clients as a confidentiality risk. Stop the conversation immediately and resume it in a private place; switching to a first name still risks identifying the client.",
      "references": [
        "HIPAA privacy education (public, HHS summaries)"
      ]
    },
    {
      "id": "fun-09",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "A calm, alert, oriented adult refuses a prescribed blood draw. What is the most appropriate response?",
      "choices": [
        "Proceed with the draw because it is on the order sheet",
        "Restrain the client long enough to complete the draw",
        "Respect the refusal: explain risks and alternatives in plain language, document the refusal, and notify the provider",
        "Label the client noncompliant and stop further teaching for the day"
      ],
      "answerIndex": 2,
      "explanation": "Competent adults have the right to refuse care. The nurse explores the concern, explains consequences simply, documents the informed refusal, and tells the provider so the plan can be adjusted. Restraining a calm, competent client for a routine draw is not appropriate; autonomy is central to safe care.",
      "references": [
        "Standard patient-rights and advocacy teaching (public)"
      ]
    },
    {
      "id": "pri-01",
      "category": "Priority Setting",
      "difficulty": "hard",
      "question": "Four clients need the nurse's attention right now. Which client should the nurse see FIRST?",
      "choices": [
        "A postoperative client reporting an oral temperature of 37.9 °C (100.0 °F)",
        "A postoperative client with new, high-pitched inspiratory stridor",
        "A client requesting a routine PRN analgesic",
        "A client asking for an extra blanket"
      ],
      "answerIndex": 1,
      "explanation": "New stridor suggests possible airway compromise, the highest priority in ABC-based triage: airway assessment and access to rescue measures come before treating fever, pain, or comfort needs. The other clients are cared for promptly afterward and appropriately documented.",
      "references": [
        "Standard ABC prioritization framework (public NCLEX pedagogy)"
      ]
    },
    {
      "id": "pri-02",
      "category": "Priority Setting",
      "difficulty": "medium",
      "question": "During rounds, which finding should the nurse address FIRST?",
      "choices": [
        "A stable client asking about dismissal paperwork",
        "A stable client scheduled for a routine dressing change",
        "A client with chest pain that started a few minutes ago, sweating and slightly pale",
        "A client due for a scheduled antihypertensive dose"
      ],
      "answerIndex": 2,
      "explanation": "New chest pain with diaphoresis and pallor is potentially unstable and time-sensitive. Unstable, acute findings come before chronic, routine, or scheduled care; the standard sequence is rapid assessment, vital signs, and reporting per protocol, then resuming the day's plan.",
      "references": [
        "Standard unstable-versus-stable prioritization (public NCLEX pedagogy)"
      ]
    },
    {
      "id": "pri-03",
      "category": "Priority Setting",
      "difficulty": "medium",
      "question": "Which task is appropriate to delegate to an assistive person (UAP) on an acute unit?",
      "choices": [
        "Teaching a newly admitted client a low-sodium meal plan",
        "Evaluating whether a client's lung sounds have cleared",
        "Obtaining routine vital signs on stable clients and reporting the results",
        "Interpreting a newly irregular heart rhythm and changing a cardiac medication"
      ],
      "answerIndex": 2,
      "explanation": "Routine vital signs on stable clients fall within typical UAP scope when results are reported back to the nurse. Assessment, teaching, interpretation, and medication changes remain the nurse's responsibility, and the nurse confirms client stability before delegating each task.",
      "references": [
        "Standard delegation education (public NCSBN materials)"
      ]
    },
    {
      "id": "edu-01",
      "category": "Patient Education",
      "difficulty": "medium",
      "question": "A conscious adult with diabetes has shakiness and sweating and a glucose reading lower than expected. Which initial self-treatment reflects the classic public diabetes teaching?",
      "choices": [
        "Take about 15 g of a fast-acting carbohydrate, such as juice or glucose tablets, wait 15 minutes, then recheck",
        "Skip the next meal to let the level rebalance",
        "Take extra insulin to bring the level down",
        "Lie down until the next scheduled glucose check"
      ],
      "answerIndex": 0,
      "explanation": "The widely taught approach for a low episode in a conscious adult is about 15 g of fast-acting carbohydrate, wait 15 minutes, recheck, and repeat once if needed, followed by a plan for a snack or meal. Severe symptoms call for the client's own emergency plan and help; insulin would push the level lower.",
      "references": [
        "ADA hypoglycemia 15/15 rule (public education)"
      ]
    },
    {
      "id": "edu-02",
      "category": "Patient Education",
      "difficulty": "easy",
      "question": "Which cluster of symptoms is classically taught as pointing to HIGH blood glucose in someone with diabetes?",
      "choices": [
        "Frequent urination, increased thirst, and increased hunger",
        "Constipation, weight gain, and dry hair",
        "Rash, itching, and joint pain",
        "Cough, runny nose, and sneezing"
      ],
      "answerIndex": 0,
      "explanation": "When glucose runs high, it spills into the urine and pulls water with it: the classic triad is frequent urination (polyuria), thirst (polydipsia), and hunger (polyphagia), sometimes with blurred vision or fatigue. Persistently high readings deserve follow-up with the client's diabetes team.",
      "references": [
        "Standard diabetes education (public ADA and NIDDK materials)"
      ]
    },
    {
      "id": "edu-03",
      "category": "Patient Education",
      "difficulty": "medium",
      "question": "A client who takes insulin has an upset stomach and cannot tolerate food. Which core sick-day teaching is most commonly given in public diabetes education?",
      "choices": [
        "Skip insulin entirely until eating resumes",
        "Continue insulin as prescribed, check glucose (and ketones when advised) more often, and contact the care team if eating or drinking stays difficult",
        "Double the insulin so the level cannot rise",
        "Fast until feeling better, then return to the usual plan"
      ],
      "answerIndex": 1,
      "explanation": "Sick-day teaching keeps insulin in the plan because the body usually still needs it, adds more frequent glucose checks, and directs clients to their care team for persistent high readings, vomiting, or ketones. Stopping insulin or fasting by improvisation can quickly become dangerous.",
      "references": [
        "ADA and NIDDK sick-day rules (public education)"
      ]
    },
    {
      "id": "edu-04",
      "category": "Patient Education",
      "difficulty": "easy",
      "question": "Which teaching point is standard when teaching a client who self-injects insulin?",
      "choices": [
        "Always inject in the exact same spot for consistent absorption",
        "Rotate injection sites within recommended areas, such as the abdomen, thighs, and upper arms, to avoid lumps that change absorption",
        "Choose the tenderest area for faster absorption",
        "Inject through clothing routinely for convenience"
      ],
      "answerIndex": 1,
      "explanation": "Repeated injections into one spot can cause lipohypertrophy, firm lumps that make absorption erratic, so clients are taught to rotate sites within healthy tissue. Injecting through clothing is not standard practice. Reinforce the client's original training for the specific insulin they use.",
      "references": [
        "Standard insulin self-injection education (public)"
      ]
    },
    {
      "id": "edu-05",
      "category": "Patient Education",
      "difficulty": "easy",
      "question": "Which approach best reflects widely taught pain-assessment standards?",
      "choices": [
        "Administer pain medicine only when visible signs such as grimacing appear",
        "Accept the client's report of pain, assess regularly, and act on orders and policy, since self-report is the primary source",
        "Advise clients that discomfort is expected and should only be reported when severe",
        "Rate the pain yourself and document your rating instead of the client's report"
      ],
      "answerIndex": 1,
      "explanation": "Widely taught standards treat the client's self-report as the primary information about their pain, paired with regular reassessment and action within orders. Waiting for grimacing or substituting your own rating delays care.",
      "references": [
        "Standard pain-assessment education (public)"
      ]
    },
    {
      "id": "nut-01",
      "category": "Nutrition and Fluids",
      "difficulty": "medium",
      "question": "A client taking a loop diuretic asks for examples of potassium-rich foods. Which selection is best?",
      "choices": [
        "Butter and mayonnaise",
        "White rice and plain pasta",
        "Bananas, oranges, potatoes, and spinach",
        "Plain crackers and diet soda"
      ],
      "answerIndex": 2,
      "explanation": "Foods naturally rich in potassium include bananas, oranges and orange juice, potatoes, spinach, avocados, and beans. Loop diuretics can lower potassium, so intake matters; the target is set by the prescriber, because kidney function and certain medications change whether extra potassium is wise.",
      "references": [
        "Standard nutrition and medication education (public)"
      ]
    },
    {
      "id": "nut-02",
      "category": "Nutrition and Fluids",
      "difficulty": "medium",
      "question": "Which finding at a peripheral IV site suggests infiltration rather than phlebitis?",
      "choices": [
        "Coolness, swelling, and pallor at the site with slowed flow",
        "Warmth, redness, and a painful streak along the vein",
        "Fever with an itchy rash on the opposite arm",
        "Numbness in the fingers of the opposite hand"
      ],
      "answerIndex": 0,
      "explanation": "Infiltration produces cool, pale, puffy skin around the site, often with slowed infusion, because fluid is leaving the vein into tissue. Phlebitis gives a warm, red, tender, or streaked vein. Each is managed per your facility's IV policy, and certain medications that leak into tissue need immediate attention.",
      "references": [
        "Standard IV-complication education (public)"
      ]
    },
    {
      "id": "nut-03",
      "category": "Nutrition and Fluids",
      "difficulty": "medium",
      "question": "Which practice most strongly supports urinary-catheter infection prevention in published prevention bundles?",
      "choices": [
        "Opening the system frequently to help urine drain accurately",
        "Keeping the drainage bag below bladder level and off the floor with unobstructed tubing, and removing the catheter as soon as it is no longer needed",
        "Changing catheters daily",
        "Clamping the tubing routinely between bathroom trips"
      ],
      "answerIndex": 1,
      "explanation": "Catheter-associated UTI prevention bundles emphasize a closed system, the bag kept below bladder level and off the floor, unobstructed flow, hand hygiene before and after contact, and removing the catheter at the earliest possible time.",
      "references": [
        "CAUTI prevention bundle summaries (public CDC materials)"
      ]
    },
    {
      "id": "nut-04",
      "category": "Nutrition and Fluids",
      "difficulty": "easy",
      "question": "While recording a client's fluid intake, which of the following should be counted?",
      "choices": [
        "Only IV fluids",
        "Only oral liquids the client drinks from a cup",
        "All sources: oral liquids, tube feedings, IV fluids, and flushes, converted to milliliters and totaled per unit policy",
        "Nothing, since output is the only number that matters"
      ],
      "answerIndex": 2,
      "explanation": "Accurate fluid records include every source: oral liquids, tube feedings, IV fluids, and flushes, each converted to milliliters (a standard 8-ounce cup holds about 240 mL) and totaled per your facility's policy, which also defines how items such as ice chips are counted.",
      "references": [
        "Standard intake-and-output education (public)"
      ]
    },
    {
      "id": "ped-01",
      "category": "Growth and Development",
      "difficulty": "medium",
      "question": "When does an infant's anterior fontanelle normally close?",
      "choices": [
        "By 2 to 3 months of age",
        "Between 12 and 18 months of age",
        "At birth",
        "Around age 5 years"
      ],
      "answerIndex": 1,
      "explanation": "The posterior fontanelle typically closes by about 2 to 3 months of age, and the anterior fontanelle commonly closes between roughly 12 and 18 months. A fontanelle that is markedly sunken or persistently bulging deserves clinical evaluation.",
      "references": [
        "Standard pediatric growth references (public)"
      ]
    },
    {
      "id": "ped-02",
      "category": "Growth and Development",
      "difficulty": "medium",
      "question": "Which findings in an infant most strongly suggest dehydration and should be reported promptly?",
      "choices": [
        "One episode of crying during a playful afternoon",
        "Sunken anterior fontanelle, fewer tears when crying, decreased wet diapers, and increasing lethargy",
        "A bulging fontanelle during vigorous crying only",
        "Wet diapers that are wetter and more frequent than the usual baseline"
      ],
      "answerIndex": 1,
      "explanation": "Classic infant dehydration signs include a sunken fontanelle, sunken eyes, fewer or no tears with crying, fewer wet diapers, dry mucous membranes, and increasing lethargy. Infants can worsen quickly, so these findings warrant urgent reporting and care per your facility's protocol.",
      "references": [
        "Standard pediatric dehydration education (public)"
      ]
    }
  ]
};
  root.NCLEX = root.NCLEX || {};
  root.NCLEX.STARTER_BANK = BANK;
  if (typeof module === "object" && module.exports) { module.exports = BANK; }
})(typeof globalThis === "object" && globalThis !== null ? globalThis : typeof self === "object" ? self : this);
