public class shfa{

    public static boolean sl(String strc){
        if (strc.contains(" ")) {
        return true;
    }
    else return false;
    }

    public static void main(String[] args) {
     boolean gn = sl("HirdeshKesarya");
     System.out.println(gn);
}
}
