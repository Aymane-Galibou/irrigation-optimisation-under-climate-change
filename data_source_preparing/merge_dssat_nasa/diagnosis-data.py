import pandas as pd

df = pd.read_csv("xdata.csv")

print("Colonnes presentes :", list(df.columns))
print()

# Test 1 : la cible existe-t-elle sous le bon schema (post-correction) ?
if 'IRR_daily' in df.columns or 'IRRC' in df.columns:
    print("[!] ALERTE : colonnes 'IRR_daily'/'IRRC' presentes -> ce CSV vient probablement "
          "d'une version du script AVANT la correction de la cible (reconstruction pre-irrigation). "
          "Il faut regenerer le dataset avec la derniere version de dssat_calculator.py.")
else:
    print("OK : pas de colonnes IRR_daily/IRRC brutes -> schema recent probable.")

print()

# Test 2 : correlation empirique tmax <-> deficit, en excluant les jours de pluie
dry_days = df[df['rain'] < 1.0]
print(f"Jours secs (rain<1mm) : {len(dry_days)} lignes")
bins = pd.cut(dry_days['tmax'], bins=[0,20,25,30,35,40,45,50])
print(dry_days.groupby(bins)['SWTD_deficit_mm'].agg(['mean','count']))
print()
print("-> Si la moyenne du deficit BAISSE quand tmax AUGMENTE (par temps sec), "
      "c'est le signal que la cible est encore polluee par l'irrigation du meme jour.")

# Test 3 : combinaison exacte testee dans le scenario existe-t-elle dans les donnees ?
similar = df[(df['tmax']>40) & (df['rain']<2) & (df['feature_crop']=='Maize')]
print(f"\nLignes similaires au Scenario 1 (tmax>40, rain<2, Maize) dans le dataset : {len(similar)}")
if len(similar) > 0:
    print(similar[['tmax','rain','prev_day_deficit_mm','SWTD_deficit_mm']].describe())

# Test 4 : couverture de l'espace d'etats prev_day_deficit_mm --
# le vrai risque de production. On veut une distribution CONTINUE, pas
# des paquets separes par des trous (ce qui indiquerait qu'une ferme
# reelle tombant dans la zone intermediaire serait mal couverte).
print("\n--- Couverture de prev_day_deficit_mm (tranches de 10mm) ---")
bins2 = pd.cut(df['prev_day_deficit_mm'], bins=range(0, 150, 10))
coverage = df.groupby(bins2).size()
print(coverage)
empty_bins = coverage[coverage == 0]
if len(empty_bins) > 0:
    print(f"\n[!] ALERTE : {len(empty_bins)} tranches de deficit totalement absentes du "
          f"dataset -> {list(empty_bins.index)}")
    print("    Une ferme reelle dans cette plage serait en extrapolation.")
else:
    print("\nOK : pas de trou detecte dans la couverture du deficit.")